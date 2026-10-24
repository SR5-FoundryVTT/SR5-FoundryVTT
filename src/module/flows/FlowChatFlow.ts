import { FLAGS, SYSTEM_NAME } from "@/module/constants";
import { FLOW_ROOT_STEP, FlowNextEntry, FlowState } from "@/module/types/flows/FlowStep";
import { TestCreator } from "@/module/tests/TestCreator";
import { Helpers } from "@/module/helpers";
import { FlowPlan } from "./FlowPlan";
import { FlowRunner } from "./FlowRunner";

const STEPS_TEMPLATE = 'systems/shadowrun5e/dist/templates/rolls/parts/flow-steps.hbs';
const APPLY_TEMPLATE = 'systems/shadowrun5e/dist/templates/rolls/parts/flow-apply.hbs';

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

        const opposedButtons = html.querySelector<HTMLElement>('.opposed-action')?.closest<HTMLElement>('.card-buttons');
        if (!opposedButtons) return;

        const content = await foundry.applications.handlebars.renderTemplate(STEPS_TEMPLATE, { rows });
        opposedButtons.insertAdjacentHTML('beforebegin', content);
        // The rows replace casting the opposing test for selected tokens.
        opposedButtons.remove();
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
     * Rows for prompted steps following the root test, for subjects known on the message.
     */
    rows(message: ChatMessage) {
        const state = FlowRunner.getState(message);
        if (!state || state.stepId !== FLOW_ROOT_STEP) return [];

        return state.next.flatMap(entry => {
            const step = FlowPlan.step(state.plan, entry.stepId);
            if (!step || !entry.subjectUuid || !FlowRunner.canPromptStep(step)) return [];

            const testCls = TestCreator._getTestClass(step.test);
            return [{
                ...FlowChatFlow._subjectRow(state, entry),
                label: testCls?.label ?? step.test,
                isDone: entry.status === 'done',
            }];
        });
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

            return [{
                ...row,
                label: isDamage ? 'SR5.Flow.ApplyDamage' : 'SR5.Flow.ApplyEffects',
                damage: isDamage ? damage : undefined,
            }];
        });
    },

    /**
     * Row data shared by all rows showing a step for a subject.
     */
    _subjectRow(state: FlowState, entry: FlowNextEntry) {
        const subjectUuid = entry.subjectUuid || (FlowPlan.step(state.plan, entry.stepId)?.actor === 'self' ? state.rootActorUuid : '');
        const subject = subjectUuid ? fromUuidSync(subjectUuid) as { name?: string } | null : null;
        const actor = FlowRunner.resolveActor(subjectUuid);

        return {
            stepId: entry.stepId,
            subjectUuid,
            name: subject?.name ?? actor?.name ?? '',
            isPending: entry.status === 'pending',
            canExecute: !!game.user?.isGM || !!actor?.isOwner,
        };
    },

    async _onExecuteStep(message: ChatMessage, event: MouseEvent) {
        event.preventDefault();
        const { stepId, subjectUuid } = (event.currentTarget as HTMLElement).dataset;
        if (!stepId || !subjectUuid) return;

        const showDialog = !TestCreator.shouldHideDialog(event);
        await FlowRunner.executePromptStep(message, stepId, subjectUuid, showDialog);
    },

    async _onApplyStep(message: ChatMessage, event: MouseEvent) {
        event.preventDefault();
        const { stepId, subjectUuid } = (event.currentTarget as HTMLElement).dataset;
        if (!stepId || !subjectUuid) return;

        await FlowRunner.applyPromptEntry(message, stepId, subjectUuid);
    },
};
