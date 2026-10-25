import { FLAGS, SYSTEM_NAME } from "@/module/constants";
import { FLOW_ROOT_STEP, FlowNextEntry, FlowState, FlowStep } from "@/module/types/flows/FlowStep";
import { TestCreator } from "@/module/tests/TestCreator";
import { Helpers } from "@/module/helpers";
import { FlowPlan } from "./FlowPlan";
import { FlowRunner } from "./FlowRunner";
import { FlowGates } from "./FlowGates";

const STEPS_TEMPLATE = 'systems/shadowrun5e/dist/templates/rolls/parts/flow-steps.hbs';
const APPLY_TEMPLATE = 'systems/shadowrun5e/dist/templates/rolls/parts/flow-apply.hbs';

/**
 * A row of the steps following a test, for one subject.
 */
export interface FlowStepRow {
    stepId: string;
    subjectUuid: string;
    name: string;
    label: string;
    isPending: boolean;
    isDone: boolean;
    canExecute: boolean;
    isGated?: boolean;
    canSkipDefense?: boolean;
    isChoice?: boolean;
    chosen?: string;
    options?: { value: string, label: string }[];
}

/**
 * Show the steps following a test on its chat message, one row per subject.
 *
 * Chat message content is rendered once on creation, while the flow state changes as steps are done.
 * The rows are therefore rendered from the flow state every time the message renders.
 */
export const FlowChatFlow = {
    async chatMessageListeners(message: ChatMessage, html: HTMLElement) {
        await FlowChatFlow._renderStepRows(message, html);
        await FlowChatFlow._renderApplyRows(message, html);

        for (const button of html.querySelectorAll<HTMLElement>('.flow-step-action')) {
            button.addEventListener('click', event => void FlowChatFlow._onExecuteStep(message, event));
        }
        for (const button of html.querySelectorAll<HTMLElement>('.flow-step-nodefense')) {
            button.addEventListener('click', event => void FlowChatFlow._onSkipDefense(message, event));
        }
        for (const button of html.querySelectorAll<HTMLElement>('.flow-step-choice')) {
            button.addEventListener('click', event => void FlowChatFlow._onChoose(message, event));
        }
        for (const button of html.querySelectorAll<HTMLElement>('.flow-apply-action')) {
            button.addEventListener('click', event => void FlowChatFlow._onApplyStep(message, event));
        }
        for (const link of html.querySelectorAll<HTMLElement>('.sr5-flow-step__subject')) {
            link.addEventListener('click', event => void Helpers.renderEntityLinkSheet(event));
        }
    },

    async _renderStepRows(message: ChatMessage, html: HTMLElement) {
        const rows = FlowChatFlow.rows(message);
        if (!rows.length) return;

        const content = await foundry.applications.handlebars.renderTemplate(STEPS_TEMPLATE, { rows });

        const opposedButtons = html.querySelector<HTMLElement>('.opposed-action')?.closest<HTMLElement>('.card-buttons');
        if (opposedButtons) {
            opposedButtons.insertAdjacentHTML('beforebegin', content);
            // The rows replace casting the opposing test for selected tokens.
            opposedButtons.remove();
            return;
        }

        // Cards of steps deeper in the chain have no opposed button to replace.
        html.querySelector<HTMLElement>('.sr5.chat-card')?.insertAdjacentHTML('beforeend', content);
    },

    async _renderApplyRows(message: ChatMessage, html: HTMLElement) {
        const rows = FlowChatFlow.applyRows(message);
        if (!rows.length) return;

        const card = html.querySelector<HTMLElement>('.sr5.chat-card');
        if (!card) return;

        const content = await foundry.applications.handlebars.renderTemplate(APPLY_TEMPLATE, { rows });
        card.insertAdjacentHTML('beforeend', content);
    },

    /**
     * Rows for steps following the test of a message, for subjects known on the message:
     * prompted tests, tests waiting on a gate, and choices with their options.
     */
    rows(message: ChatMessage): FlowStepRow[] {
        const state = FlowRunner.getState(message);
        if (!state) return [];

        return state.next.flatMap<FlowStepRow>(entry => {
            const step = FlowPlan.step(state.plan, entry.stepId);
            if (!step || (!entry.subjectUuid && !entry.pick)) return [];

            if (step.kind === 'choice') {
                const options = (step.config.options ?? []) as string[];
                const row = FlowChatFlow._subjectRow(state, entry);
                return [{
                    ...row,
                    label: 'SR5.Flow.Choice',
                    isDone: entry.status === 'done',
                    isChoice: true,
                    chosen: entry.outcome?.[0] ? FlowChatFlow.optionLabel(entry.outcome[0]) : '',
                    options: options.map(option => ({ value: option, label: FlowChatFlow.optionLabel(option) })),
                    canExecute: FlowGates.canChoose(entry, FlowRunner.resolveActor),
                }];
            }

            if (step.kind !== 'test') return [];
            if (!entry.gated && !FlowRunner.canPromptStep(step, entry)) return [];

            const testCls = TestCreator._getTestClass(step.test);
            return [{
                ...FlowChatFlow._subjectRow(state, entry),
                label: testCls?.label ?? step.test,
                isDone: entry.status === 'done',
                isGated: !!entry.gated,
                canSkipDefense: FlowRunner.canSkipDefense(step),
            }];
        });
    },

    /**
     * The label of a choice option. Known options are localized, others shown by their key.
     */
    optionLabel(option: string): string {
        const key = `SR5.Flow.Options.${option}`;
        return game.i18n.has(key) ? key : option;
    },

    /**
     * Rows for damage and effects to apply to the subjects of a message.
     */
    applyRows(message: ChatMessage) {
        const state = FlowRunner.getState(message);
        if (!state) return [];

        const testData = message.getFlag(SYSTEM_NAME, FLAGS.Test) as { data?: object } | undefined;
        const damage = testData?.data ? FlowRunner.resultDamage(testData.data) : undefined;

        return state.next.flatMap(entry => {
            const step = FlowPlan.step(state.plan, entry.stepId);
            if (!step || !FlowRunner.isApplyStep(step) || entry.status === 'skipped') return [];

            const row = FlowChatFlow._subjectRow(state, entry);
            if (!row.subjectUuid) return [];

            const isDamage = step.kind === 'applyDamage';
            if (isDamage && !damage?.value) return [];
            // Marks are placed by the matrix tests and secondary effects follow the damage, there's nothing to click.
            if (step.kind === 'placeMarks' || step.kind === 'elemental') return [];

            return [{
                ...row,
                label: FlowChatFlow.applyLabel(step),
                damage: isDamage ? damage : undefined,
            }];
        });
    },

    /**
     * The label of a row applying a step.
     */
    applyLabel(step: FlowStep): string {
        switch (step.kind) {
            case 'applyDamage': return 'SR5.Flow.ApplyDamage';
            case 'applyEffects': return 'SR5.Flow.ApplyEffects';
            case 'modifyCombatantInit': return `${game.i18n.localize('SR5.InitiativeMod')} ${String(step.config.value ?? '')}`;
            case 'forceReboot': return 'SR5.Flow.ForceReboot';
        }
        return String(step.config.label || step.kind);
    },

    /**
     * Row data shared by all rows showing a step for a subject.
     */
    _subjectRow(state: FlowState, entry: FlowNextEntry) {
        const subjectUuid = entry.subjectUuid || (FlowPlan.step(state.plan, entry.stepId)?.actor === 'self' ? state.rootActorUuid : '');
        const subject = subjectUuid ? fromUuidSync(subjectUuid) as { name?: string } | null : null;
        // A subject to pick is picked by whoever started the chain.
        const actor = FlowRunner.resolveActor(entry.pick ? state.rootActorUuid : subjectUuid);

        // Steps rolled by the GM, like an opposition without an actor, can only be started by them.
        const gmOnly = FlowPlan.step(state.plan, entry.stepId)?.roller === 'gm';

        return {
            stepId: entry.stepId,
            subjectUuid,
            name: entry.pick ? game.i18n.localize('SR5.Flow.PickTarget') : subject?.name ?? actor?.name ?? '',
            isPending: entry.status === 'pending',
            canExecute: !!game.user?.isGM || (!gmOnly && !!actor?.isOwner),
        };
    },

    async _onExecuteStep(message: ChatMessage, event: MouseEvent) {
        event.preventDefault();
        const { stepId, subjectUuid } = (event.currentTarget as HTMLElement).dataset;
        // Subjects to pick have none yet.
        if (!stepId || subjectUuid === undefined) return;

        const showDialog = !TestCreator.shouldHideDialog(event);
        await FlowRunner.executePromptStep(message, stepId, subjectUuid, showDialog);
    },

    async _onChoose(message: ChatMessage, event: MouseEvent) {
        event.preventDefault();
        const { stepId, subjectUuid, option } = (event.currentTarget as HTMLElement).dataset;
        if (!stepId || !subjectUuid || !option) return;

        await FlowGates.choose(message, stepId, subjectUuid, option);
    },

    /**
     * The defender doesn't defend and takes the attack as a success test. SR5#190.
     */
    async _onSkipDefense(message: ChatMessage, event: MouseEvent) {
        event.preventDefault();
        const { stepId, subjectUuid } = (event.currentTarget as HTMLElement).dataset;
        if (!stepId || !subjectUuid) return;

        await FlowRunner.executePromptStep(message, stepId, subjectUuid, false, ['noDefense']);
    },

    async _onApplyStep(message: ChatMessage, event: MouseEvent) {
        event.preventDefault();
        const { stepId, subjectUuid } = (event.currentTarget as HTMLElement).dataset;
        if (!stepId || !subjectUuid) return;

        await FlowRunner.applyPromptEntry(message, stepId, subjectUuid);
    },
};
