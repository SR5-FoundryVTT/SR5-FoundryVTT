import { FLAGS, SYSTEM_NAME } from "@/module/constants";
import type { SR5Actor } from "@/module/actor/SR5Actor";
import type { SuccessTest } from "@/module/tests/SuccessTest";
import type { OpposedTest } from "@/module/tests/OpposedTest";
import { TestCreator } from "@/module/tests/TestCreator";
import { SocketMessage } from "@/module/sockets";
import { DamageApplicationFlow } from "@/module/actor/flows/DamageApplicationFlow";
import type { DamageType } from "@/module/types/item/Action";
import { FLOW_ROOT_STEP, FlowNextEntry, FlowState, FlowStep } from "@/module/types/flows/FlowStep";
import { FlowPlan } from "./FlowPlan";

/**
 * Track and continue tests as steps of a test flow.
 *
 * Every chat message of a flow stores a FlowState: which step it's the result of, the chain it belongs to
 * and which steps follow it, per subject.
 */
export const FlowRunner = {
    /**
     * Determine the flow state of a completed test and store it on its chat message.
     *
     * Tests without a message still get a flow state, so steps following them can run. It's just not stored.
     *
     * @returns The flow state, or undefined for tests without anything following them.
     */
    async recordTest(test: SuccessTest): Promise<FlowState | undefined> {
        const uuid = test.data.messageUuid;
        const message = uuid ? await fromUuid<ChatMessage>(uuid) ?? undefined : undefined;

        const state = FlowRunner.buildState(test, message);
        if (!state || !message) return state;

        console.debug(`Shadowrun 5e | Flow step ${state.stepId} of chain ${state.chainId}`, state);
        await message.setFlag(SYSTEM_NAME, FLAGS.Flow, state);
        if (state.parentMessageUuid) await FlowRunner.markParentStep(message);

        return state;
    },

    /**
     * Build the flow state for a completed test.
     *
     * A test following a message with flow state continues that chain. A test not following
     * any other test starts a new chain. An opposing test without a chain to continue (following
     * a message from before flows or a test without message) derives its chain from the test it opposes.
     */
    buildState(test: SuccessTest, message?: ChatMessage): FlowState | undefined {
        const parentMessage = FlowRunner.parentMessage(test);
        const parent = parentMessage ? FlowRunner.getState(parentMessage) : undefined;
        if (parentMessage && parent) return FlowRunner.buildChildState(test, parentMessage, parent);

        if (test.opposing) return FlowRunner.buildOpposingState(test as OpposedTest);
        if (FlowRunner.isFollowingTest(test)) return undefined;
        return FlowRunner.buildRootState(test, message);
    },

    buildRootState(test: SuccessTest, message?: ChatMessage): FlowState | undefined {
        const plan = FlowPlan.resolve(test);
        if (!plan.length) return undefined;

        const state: FlowState = {
            v: 1,
            chainId: foundry.utils.randomID(),
            rootMessageUuid: message?.uuid ?? '',
            rootActorUuid: test.actor?.uuid ?? '',
            parentMessageUuid: '',
            stepId: FLOW_ROOT_STEP,
            plan,
            subjectUuid: test.actor?.uuid ?? '',
            targets: FlowRunner.rootTargets(test),
            next: [],
        };
        state.next = FlowRunner.nextEntries(test, state);
        return state;
    },

    buildChildState(test: SuccessTest, parentMessage: ChatMessage, parent: FlowState): FlowState | undefined {
        const entry = FlowRunner.matchNextEntry(test, parent);
        if (!entry) return undefined;

        const state: FlowState = {
            v: 1,
            chainId: parent.chainId,
            rootMessageUuid: parent.rootMessageUuid,
            rootActorUuid: parent.rootActorUuid,
            parentMessageUuid: parentMessage.uuid ?? '',
            stepId: entry.stepId,
            plan: parent.plan,
            subjectUuid: test.actor?.uuid ?? entry.subjectUuid,
            targets: parent.targets,
            next: [],
        };
        state.next = FlowRunner.nextEntries(test, state);
        return state;
    },

    /**
     * Build the flow state of an opposing test from the test it opposes.
     */
    buildOpposingState(test: OpposedTest): FlowState | undefined {
        const root = test.against;
        if (!root) return undefined;

        const plan = FlowPlan.resolve(root);
        const rootNext: FlowNextEntry[] = FlowPlan.children(plan, FLOW_ROOT_STEP)
            .map(step => ({ stepId: step.id, subjectUuid: '', status: 'pending' }));
        const entry = FlowRunner.matchNextEntry(test, { plan, next: rootNext } as FlowState);
        if (!entry) return undefined;

        const subjectUuid = test.actor?.uuid ?? '';
        const state: FlowState = {
            v: 1,
            chainId: foundry.utils.randomID(),
            rootMessageUuid: root.data.messageUuid ?? '',
            rootActorUuid: root.data.sourceActorUuid ?? '',
            parentMessageUuid: '',
            stepId: entry.stepId,
            plan,
            subjectUuid,
            targets: subjectUuid ? [subjectUuid] : [],
            next: [],
        };
        state.next = FlowRunner.nextEntries(test, state);
        return state;
    },

    /**
     * Determine the steps following a test and whether they apply, per subject.
     */
    nextEntries(test: SuccessTest, state: FlowState): FlowNextEntry[] {
        const entries: FlowNextEntry[] = [];
        const damage = FlowRunner.testDamage(test);

        for (const step of FlowPlan.children(state.plan, state.stepId)) {
            for (const subjectUuid of FlowRunner.stepSubjects(step, state)) {
                const actor = FlowRunner.resolveActor(subjectUuid);
                const allowed = FlowPlan.allows({ step, test, actor, damage });
                entries.push({ stepId: step.id, subjectUuid, status: allowed ? 'pending' : 'skipped' });
            }
        }

        return entries;
    },

    /**
     * Who a step runs for.
     * - self steps always run for the root actor.
     * - target steps following the root test run once per target, or once for an unknown subject without targets.
     * - target steps deeper in the chain stay with the subject of their parent.
     */
    stepSubjects(step: FlowStep, state: FlowState): string[] {
        if (step.actor === 'self') return [state.rootActorUuid];
        if (state.stepId !== FLOW_ROOT_STEP) return [state.subjectUuid];
        return state.targets.length ? state.targets : [''];
    },

    /**
     * Find the entry of the parent message a test is the result of.
     *
     * Entries are matched by subject first, then by test type. Should no step name the test type
     * (a subclass implementation replacing the configured test), a single remaining test step is used.
     * A test cast for an actor without its own entry continues the chain for that actor.
     */
    matchNextEntry(test: SuccessTest, parent: FlowState): FlowNextEntry | undefined {
        const actorUuid = test.actor?.uuid;
        const testEntries = parent.next.filter(entry => FlowPlan.step(parent.plan, entry.stepId)?.kind === 'test');
        const forSubject = testEntries.filter(entry => {
            if (!entry.subjectUuid || !actorUuid) return true;
            return FlowRunner.resolveActor(entry.subjectUuid)?.uuid === actorUuid;
        });

        const match = FlowRunner._matchByType(test, parent, forSubject);
        if (match) return match;

        const other = FlowRunner._matchByType(test, parent, testEntries);
        return other ? { ...other, subjectUuid: actorUuid ?? '' } : undefined;
    },

    _matchByType(test: SuccessTest, parent: FlowState, entries: FlowNextEntry[]): FlowNextEntry | undefined {
        const byType = entries.find(entry => FlowPlan.step(parent.plan, entry.stepId)?.test === test.type);
        if (byType) return byType;
        const stepIds = new Set(entries.map(entry => entry.stepId));
        return stepIds.size === 1 ? entries[0] : undefined;
    },

    /**
     * Execute all pending automatic steps following a test.
     *
     * Test steps run for subjects the current user owns, one after another, so each chain resolves
     * before the next dialog opens. Damage and effects are applied as configured by the auto apply setting.
     */
    async runNext(test: SuccessTest, state: FlowState) {
        for (const entry of state.next) {
            if (entry.status !== 'pending') continue;

            const step = FlowPlan.step(state.plan, entry.stepId);
            if (!step) continue;

            if (FlowRunner.isApplyStep(step)) {
                if (!FlowRunner.autoApplies(step)) continue;
                if (!await FlowRunner.applyStep(test, step, entry)) continue;
                entry.status = 'done';
                const message = test.data.messageUuid ? fromUuidSync(test.data.messageUuid) as ChatMessage | null : null;
                if (message) await FlowRunner.markApplied(message, entry);
                continue;
            }

            if (step.kind !== 'test' || step.mode !== 'auto') continue;

            const actor = FlowRunner.resolveActor(entry.subjectUuid) ?? (step.actor === 'self' ? test.actor : undefined);
            if (!actor?.isOwner) continue;

            await FlowRunner.executeStep(test, step);
        }
    },

    isApplyStep(step: FlowStep): boolean {
        return step.kind === 'applyDamage' || step.kind === 'applyEffects';
    },

    autoApplies(step: FlowStep): boolean {
        const setting = game.settings.get(SYSTEM_NAME, FLAGS.FlowAutoApply);
        if (setting === 'all') return true;
        return setting === 'effects' && step.kind === 'applyEffects';
    },

    /**
     * Apply the damage or effects of a test to the subject of an apply step.
     *
     * Effects are resolved against the given test, as they depend on its results.
     *
     * @returns true when applied.
     */
    async applyStep(test: SuccessTest, step: FlowStep, entry: FlowNextEntry): Promise<boolean> {
        const actor = FlowRunner.resolveActor(entry.subjectUuid) ?? (step.actor === 'self' ? test.actor : undefined);
        if (!actor) return false;

        if (step.kind === 'applyDamage') {
            if (!actor.isOwner) return false;
            const damage = FlowRunner.resultDamage(test.data);
            if (!damage) return false;
            await new DamageApplicationFlow().applyDamageToActor(actor, damage);
            return true;
        }

        if (step.kind === 'applyEffects') {
            await test.effects.createTargetActorEffects(actor);
            return true;
        }

        return false;
    },

    /**
     * Apply a pending apply step of a message for the given subject.
     */
    async applyPromptEntry(message: ChatMessage, stepId: string, subjectUuid: string) {
        const state = FlowRunner.getState(message);
        const entry = state?.next.find(entry => entry.stepId === stepId && entry.subjectUuid === subjectUuid);
        const step = state ? FlowPlan.step(state.plan, stepId) : undefined;
        if (!entry || !step || entry.status !== 'pending' || !FlowRunner.isApplyStep(step)) return;

        const test = await TestCreator.fromMessage(message.id!);
        if (!test) return;
        await test.populateTests();
        await test.populateDocuments();

        if (!await FlowRunner.applyStep(test, step, entry)) return;
        await FlowRunner.markApplied(message, entry);
    },

    /**
     * The damage resulting from a test, to be applied to the subject of steps following it.
     */
    resultDamage(data: object): DamageType | undefined {
        const record = data as { modifiedDrain?: DamageType, modifiedFade?: DamageType, modifiedDamage?: DamageType, damage?: DamageType };
        return record.modifiedDrain ?? record.modifiedFade ?? record.modifiedDamage ?? record.damage;
    },

    /**
     * Mark an apply step of a message as done.
     *
     * Users that can't update the message ask the GM to do it.
     */
    async markApplied(message: ChatMessage, entry: FlowNextEntry) {
        if (game.user && message.canUserModify(game.user, 'update')) {
            await FlowRunner._markApplied(message, entry.stepId, entry.subjectUuid);
            return;
        }

        try {
            SocketMessage.emitForGM(FLAGS.FlowApplyDone, { messageUuid: message.uuid, stepId: entry.stepId, subjectUuid: entry.subjectUuid });
        } catch (error) {
            console.warn('Shadowrun 5e | Could not mark flow step as applied on its message', error);
        }
    },

    async _markApplied(message: ChatMessage, stepId: string, subjectUuid: string) {
        const state = FlowRunner.getState(message);
        if (!state) return;

        const next = foundry.utils.deepClone(state.next);
        const entry = next.find(entry => entry.stepId === stepId && entry.subjectUuid === subjectUuid);
        if (!entry) return;
        entry.status = 'done';

        await message.setFlag(SYSTEM_NAME, FLAGS.Flow, { ...state, next });
    },

    /**
     * Handle a user asking to mark an apply step as done on a message they can't update.
     *
     * Only users owning the subject of the step can do so.
     */
    async _handleApplyDoneSocketMessage(message: Shadowrun.SocketMessageData, senderId?: string) {
        if (!game.user?.isGM) return;
        const { messageUuid, stepId, subjectUuid } = (message.data ?? {}) as Record<string, unknown>;
        if (typeof messageUuid !== 'string' || typeof stepId !== 'string' || typeof subjectUuid !== 'string') return;

        const sender = senderId ? game.users?.get(senderId) : undefined;
        const actor = FlowRunner.resolveActor(subjectUuid);
        if (!sender || !actor?.testUserPermission(sender, 'OWNER')) return;

        const chatMessage = await fromUuid<ChatMessage>(messageUuid);
        if (!chatMessage) return;
        await FlowRunner._markApplied(chatMessage, stepId, subjectUuid);
    },

    /**
     * Execute a test step directly following the given test.
     */
    async executeStep(parent: SuccessTest, step: FlowStep) {
        if (step.actor === 'self') {
            await parent.executeFollowUpTest(step.test);
            return;
        }

        if (parent.opposing) {
            const test = await TestCreator.fromOpposedTestResistTest(parent as OpposedTest, parent.data.options, step.test);
            if (!test) return;
            await test.execute();
            return;
        }

        console.warn(`Shadowrun 5e | Flow step ${step.id} can't be executed automatically after a ${parent.type}`, step);
    },

    /**
     * Execute a step following the root test of a message for the given subject.
     *
     * @param message The message holding the root test.
     * @param stepId The step to execute.
     * @param subjectUuid The actor or token to execute the step for.
     * @param showDialog Show the test dialog.
     */
    async executePromptStep(message: ChatMessage, stepId: string, subjectUuid: string, showDialog = true) {
        const state = FlowRunner.getState(message);
        const step = state ? FlowPlan.step(state.plan, stepId) : undefined;
        if (!state || !step || !FlowRunner.canPromptStep(step)) return;

        const testCls = TestCreator._getTestClass(step.test);
        const actor = FlowRunner.resolveActor(subjectUuid);
        const testData = message.getFlag(SYSTEM_NAME, FLAGS.Test) as { data?: SuccessTest['data'] } | undefined;
        if (!testCls || !actor || !testData?.data) return;

        const againstData = foundry.utils.deepClone(testData.data);
        const data = await testCls._getOpposedActionTestData(againstData, actor, message.id!);
        if (!data) return;

        const test = new testCls(data, { source: actor }, { showDialog });
        await test.execute();
    },

    /**
     * Only opposing test steps following the root test and using the default actor selection can be cast
     * for a single subject. Other test implementations select their actors themselves.
     */
    canPromptStep(step: FlowStep): boolean {
        if (step.kind !== 'test' || step.mode !== 'prompt') return false;
        if (step.after !== FLOW_ROOT_STEP || step.actor !== 'target') return false;

        const testCls = TestCreator._getTestClass(step.test);
        const baseCls = TestCreator._getTestClass('SuccessTest');
        if (!testCls || !baseCls) return false;
        return testCls.executeMessageAction === baseCls.executeMessageAction;
    },

    /**
     * Mark the step a message resulted from as done on its parent message.
     *
     * Users that can't update the parent message ask the GM to do it.
     */
    async markParentStep(message: ChatMessage) {
        const state = FlowRunner.getState(message);
        const parentMessage = state?.parentMessageUuid ? fromUuidSync(state.parentMessageUuid) as ChatMessage | null : null;
        if (!parentMessage || !game.user) return;

        if (parentMessage.canUserModify(game.user, 'update')) {
            await FlowRunner._markParentStep(message);
            return;
        }

        try {
            SocketMessage.emitForGM(FLAGS.FlowStepDone, { messageUuid: message.uuid });
        } catch (error) {
            console.warn('Shadowrun 5e | Could not mark flow step as done on its parent message', error);
        }
    },

    async _markParentStep(message: ChatMessage) {
        const state = FlowRunner.getState(message);
        const parentMessage = state?.parentMessageUuid ? await fromUuid<ChatMessage>(state.parentMessageUuid) : null;
        const parent = parentMessage ? FlowRunner.getState(parentMessage) : undefined;
        if (!state || !parentMessage || !parent) return;

        const subjectActorUuid = FlowRunner.resolveActor(state.subjectUuid)?.uuid;
        const next = foundry.utils.deepClone(parent.next);
        const entry = next.find(entry => entry.stepId === state.stepId && !!entry.subjectUuid
            && FlowRunner.resolveActor(entry.subjectUuid)?.uuid === subjectActorUuid);

        const messageUuid = message.uuid ?? '';
        if (entry) Object.assign(entry, { status: 'done', messageUuid });
        else next.push({ stepId: state.stepId, subjectUuid: state.subjectUuid, status: 'done', messageUuid });

        await parentMessage.setFlag(SYSTEM_NAME, FLAGS.Flow, { ...parent, next });
    },

    /**
     * Handle a user asking to mark a flow step as done on a message they can't update.
     *
     * The step is taken from the flow state of the given message, not from the socket message.
     */
    async _handleStepDoneSocketMessage(message: Shadowrun.SocketMessageData) {
        if (!game.user?.isGM) return;
        const uuid: unknown = (message.data as { messageUuid?: unknown } | undefined)?.messageUuid;
        if (typeof uuid !== 'string') return;

        const child = await fromUuid(uuid) as ChatMessage | null;
        if (!child) return;
        await FlowRunner._markParentStep(child);
    },

    /**
     * Retrieve the message a test directly follows, if any.
     */
    parentMessage(test: SuccessTest): ChatMessage | undefined {
        const reference = (test.data as { previousMessageId?: string }).previousMessageId;
        if (!reference) return undefined;

        if (reference.includes('.')) return fromUuidSync(reference) as ChatMessage | undefined ?? undefined;
        return game.messages?.get(reference) ?? undefined;
    },

    /**
     * Tests created from another tests data carry that data along.
     */
    isFollowingTest(test: SuccessTest): boolean {
        const data = test.data as { previousMessageId?: string, against?: unknown, following?: unknown };
        return !!data.previousMessageId || !!data.against || !!data.following;
    },

    getState(message: ChatMessage): FlowState | undefined {
        return message.getFlag(SYSTEM_NAME, FLAGS.Flow);
    },

    rootTargets(test: SuccessTest): string[] {
        return [...(test.data.targetUuids ?? [])].filter(Boolean);
    },

    /**
     * Resolve an actor or token uuid to its actor.
     */
    resolveActor(uuid: string): SR5Actor | undefined {
        if (!uuid) return undefined;
        const document = fromUuidSync(uuid) as { documentName?: string, actor?: SR5Actor } | null;
        if (!document) return undefined;
        if (document.documentName === 'Token') return document.actor ?? undefined;
        if (document.documentName === 'Actor') return document as unknown as SR5Actor;
        return undefined;
    },

    /**
     * The damage a test hands on to the steps following it.
     */
    testDamage(test: SuccessTest) {
        const data = test.data as { modifiedDamage?: SuccessTest['data']['damage'] };
        return data.modifiedDamage ?? test.data.damage;
    },
};
