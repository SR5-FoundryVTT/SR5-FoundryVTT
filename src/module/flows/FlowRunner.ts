import { FLAGS, SYSTEM_NAME } from "@/module/constants";
import type { SR5Actor } from "@/module/actor/SR5Actor";
import type { SR5Item } from "@/module/item/SR5Item";
import type { SuccessTest } from "@/module/tests/SuccessTest";
import type { OpposedTest } from "@/module/tests/OpposedTest";
import { TestCreator } from "@/module/tests/TestCreator";
import { SocketMessage } from "@/module/sockets";
import { DamageApplicationFlow } from "@/module/actor/flows/DamageApplicationFlow";
import type { DamageType } from "@/module/types/item/Action";
import { FLOW_ROOT_STEP, FlowNextEntry, FlowState, FlowStep, FlowStepActor } from "@/module/types/flows/FlowStep";
import { FlowPlan } from "./FlowPlan";
import { FlowContext } from "./FlowContext";
import { FlowGates } from "./FlowGates";
import { FlowBranchContributors } from "./FlowContributors";
import { FlowTree } from "./FlowTree";
import { ElementalRules } from "@/module/rules/ElementalRules";

// Actors resolved when a step runs, as a group or relative to the parent. See FlowRunner.groupSubjects.
const FLOW_GROUP_ACTORS: FlowStepActor[] = ['participants', 'allies', 'occupants', 'owner', 'pick'];

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
        await FlowGates.releaseFromTest(test, state);

        const step = FlowPlan.step(state.plan, state.stepId);
        if (step) Hooks.callAll('sr5_flowStepComplete', step, { test, state });

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
            v: 2,
            chainId: foundry.utils.randomID(),
            rootMessageUuid: message?.uuid ?? '',
            primaryMessageUuid: message?.uuid ?? '',
            rootActorUuid: test.actor?.uuid ?? '',
            parentMessageUuid: '',
            stepId: FLOW_ROOT_STEP,
            plan,
            subjectUuid: test.actor?.uuid ?? '',
            branchUuid: '',
            targets: FlowRunner.rootTargets(test),
            participants: [...(test.data.participantUuids ?? [])],
            next: [],
            ctx: FlowContext.forRoot(test),
        };
        state.next = FlowRunner.nextEntries(test, state);
        return state;
    },

    buildChildState(test: SuccessTest, parentMessage: ChatMessage, parent: FlowState): FlowState | undefined {
        const entry = FlowRunner.matchNextEntry(test, parent);
        if (!entry) return undefined;

        const state: FlowState = {
            v: 2,
            chainId: parent.chainId,
            rootMessageUuid: parent.rootMessageUuid,
            primaryMessageUuid: parent.primaryMessageUuid ?? parent.rootMessageUuid,
            rootActorUuid: parent.rootActorUuid,
            parentMessageUuid: parentMessage.uuid ?? '',
            stepId: entry.stepId,
            plan: parent.plan,
            subjectUuid: test.actor?.uuid ?? entry.subjectUuid,
            // A picked subject starts a branch of its own.
            branchUuid: entry.pick ? test.actor?.uuid ?? '' : entry.branchUuid ?? parent.branchUuid ?? '',
            targets: parent.targets,
            participants: parent.participants,
            next: [],
            ctx: FlowContext.forChild(parent.ctx ?? {}, test, entry.stepId, !!FlowPlan.step(parent.plan, entry.stepId)?.primary),
        };
        FlowRunner.addBranchContributions(test, state);
        state.next = FlowRunner.nextEntries(test, state);
        return state;
    },

    /**
     * Add the nodes a test adds to its own branch, like a defenders power reacting to the attack.
     * Only this branch's plan gets them, see FlowBranchContributors.
     */
    addBranchContributions(test: SuccessTest, state: FlowState) {
        const step = FlowPlan.step(state.plan, state.stepId);
        if (!step) return;

        const contributions = Object.values(FlowBranchContributors).flatMap(contributor => contributor(test, step));
        if (!contributions.length) return;
        state.plan = [...state.plan, ...FlowTree.flattenContributions(test, step, contributions)];
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
            v: 2,
            chainId: foundry.utils.randomID(),
            rootMessageUuid: root.data.messageUuid ?? '',
            primaryMessageUuid: root.data.messageUuid ?? '',
            rootActorUuid: root.data.sourceActorUuid ?? '',
            parentMessageUuid: '',
            stepId: entry.stepId,
            plan,
            subjectUuid,
            branchUuid: subjectUuid,
            targets: subjectUuid ? [subjectUuid] : [],
            next: [],
            ctx: FlowContext.forChild(FlowContext.forRoot(root), test, entry.stepId),
        };
        FlowRunner.addBranchContributions(test, state);
        state.next = FlowRunner.nextEntries(test, state);
        return state;
    },

    /**
     * Determine the steps following a test and whether they apply, per subject.
     */
    nextEntries(test: SuccessTest, state: FlowState): FlowNextEntry[] {
        const entries: FlowNextEntry[] = [];
        const damage = FlowRunner.testDamage(test);
        const noVerdict = FlowRunner.hasNoVerdict(test);

        for (const step of FlowPlan.children(state.plan, state.stepId)) {
            for (const subjectUuid of FlowRunner.stepSubjects(step, state)) {
                const actor = FlowRunner.resolveActor(subjectUuid);

                // Without a verdict, steps waiting for one are left to the users to start.
                if (noVerdict && FlowRunner.waitsForVerdict(step)) {
                    const allowed = FlowPlan.matchesCondition({ step, test, actor, damage }) && test.flowAllowsStep(step);
                    entries.push({ stepId: step.id, subjectUuid, status: allowed ? 'pending' : 'skipped', prompt: true });
                    continue;
                }

                // A root without a roll counts as a success.
                const outcome = test.data.rollless ? ['always', 'success'] : undefined;
                const allowed = FlowPlan.allows({ step, test, actor, damage, outcome });
                // Steps for the targets of the root start a branch per target, deeper steps stay in theirs.
                // So do steps for each of a group, like every participant of a ritual taking drain.
                const branches = state.stepId === FLOW_ROOT_STEP || FlowRunner.startsGroup(step, state);
                const branchUuid = branches ? (step.actor === 'self' ? '' : subjectUuid) : state.branchUuid;
                const entry: FlowNextEntry = { stepId: step.id, subjectUuid, branchUuid, status: allowed ? 'pending' : 'skipped' };
                if (step.actor === 'pick' && !subjectUuid) entry.pick = true;
                if (allowed && FlowRunner.defenseIsForcedOff(step, test, actor)) entry.noDefense = 'forced';
                // A step with a before subtree waits until a step within releases it.
                if (allowed && step.config.gate) entry.gated = true;
                entries.push(entry);
            }
        }

        return entries;
    },

    /**
     * Can the defender of a defense step not defend at all, like when unaware of the attack? SR5#190.
     */
    defenseIsForcedOff(step: FlowStep, test: SuccessTest, actor?: SR5Actor): boolean {
        const noDefense = step.config.noDefense as { condition?: string } | undefined;
        if (!noDefense?.condition) return false;
        return FlowPlan.matchesCondition({ step: { ...step, condition: noDefense.condition }, test, actor });
    },

    /**
     * Can the defender of a defense step choose not to defend, like to soak a hit right away?
     */
    canSkipDefense(step: FlowStep): boolean {
        if (step.relation !== 'opposed') return false;
        const noDefense = step.config.noDefense as { allowed?: boolean } | undefined;
        return noDefense?.allowed !== false;
    },

    /**
     * A test without threshold and opposition can't tell success from failure. Any hit counts as a
     * success, while the GM might have a threshold in mind.
     */
    hasNoVerdict(test: SuccessTest): boolean {
        if (test.data.rollless) return false;
        return !test.hasThreshold && !test.opposed && !test.opposing;
    },

    /**
     * Should using an item without a test start a chain, as using a drug does?
     */
    startsRolllessChain(item: SR5Item): boolean {
        if (item.asType('chemical')?.system.kind === 'drug') return true;
        const action = item.getAction();
        return !!action && (!!action.effects?.select || !!action.results?.length);
    },

    /**
     * Start a chain without rolling, from an items card: using a drug, activating a power.
     *
     * A drug uses up a dose. The root counts as a success, so steps following it on a success run.
     *
     * @returns The item card, now the root message of the chain.
     */
    async startChain(item: SR5Item, actor: SR5Actor): Promise<ChatMessage | undefined> {
        const chemical = item.asType('chemical');
        if (chemical?.system.kind === 'drug') {
            const quantity = Number(chemical.system.technology.quantity ?? 0);
            if (quantity <= 0) {
                ui.notifications?.warn('SR5.Warnings.NoDosesLeft', { localize: true });
                return undefined;
            }
            await item.update({ 'system.technology.quantity': quantity - 1 } as Item.UpdateData);
        }

        const root = await TestCreator.fromItem(item, actor, { showDialog: true, showMessage: true });
        if (!root) return undefined;
        root.data.rollless = true;
        await root.populateDocuments();

        const message = await item.postItemCard() ?? undefined;
        if (!message) return undefined;
        root.data.messageUuid = message.uuid ?? undefined;
        // Apply rows on the card create the root again from the message.
        await root.saveToMessage(root.data.messageUuid);

        const state = FlowRunner.buildRootState(root, message);
        if (!state) return message;
        await message.setFlag(SYSTEM_NAME, FLAGS.Flow, state);
        await FlowRunner.runNext(root, state);
        return message;
    },

    /**
     * Does a step only run on a success or a failure of the test it follows?
     */
    waitsForVerdict(step: FlowStep): boolean {
        if (!step.when.length || step.when.includes('always')) return false;
        return step.when.some(when => when === 'success' || when === 'failure');
    },

    /**
     * Who a step runs for.
     * - self steps always run for the root actor.
     * - target steps following the root test run once per target, or once for an unknown subject without targets.
     * - target steps deeper in the chain stay with the subject of their parent.
     */
    stepSubjects(step: FlowStep, state: FlowState): string[] {
        if (step.actor === 'self') return [state.rootActorUuid];
        // Steps without an actor run once, rolled with the casters documents.
        if (step.actor === 'none') return [state.rootActorUuid];
        if (FlowRunner.startsGroup(step, state)) return FlowRunner.groupSubjects(step, state);
        // Deeper in the chain, steps for the target stay with the target of their branch.
        if (state.stepId !== FLOW_ROOT_STEP) return [state.branchUuid || state.subjectUuid];
        return state.targets.length ? state.targets : [''];
    },

    /**
     * Does a step name a group of actors, or an actor related to its parents, anew? Steps below such
     * a step name the same and stay within its branches.
     */
    startsGroup(step: FlowStep, state: FlowState): boolean {
        if (!FLOW_GROUP_ACTORS.includes(step.actor)) return false;
        const parent = state.stepId === FLOW_ROOT_STEP ? 'self' : FlowPlan.step(state.plan, state.stepId)?.actor;
        return parent !== step.actor;
    },

    /**
     * The subjects of a step naming a group of actors, or an actor related to its parents.
     *
     * - participants: the root actor and everyone assisting it, like ritual drain. SR5#296.
     * - allies: everyone assisting the root actor.
     * - occupants: the actor of the parent and everyone inside it, like a crashing vehicle. SR5#201.
     * - owner: whoever controls the actor of the parent, like a spirits summoner or a drones rigger.
     * - pick: picked by the user starting the step, see FlowRunner.pickedSubject.
     */
    groupSubjects(step: FlowStep, state: FlowState): string[] {
        const base = state.stepId === FLOW_ROOT_STEP ? state.rootActorUuid : (state.branchUuid || state.subjectUuid);
        switch (step.actor) {
            case 'participants': return [state.rootActorUuid, ...(state.participants ?? [])];
            case 'allies': return [...(state.participants ?? [])];
            case 'occupants': return [base, ...FlowRunner.occupants(base)];
            case 'owner': return [FlowRunner.ownerOf(base) || base];
            case 'pick': return [''];
            default: return [base];
        }
    },

    /**
     * Everyone inside a vehicle. Vehicles only know their driver.
     */
    occupants(uuid: string): string[] {
        const actor = FlowRunner.resolveActor(uuid);
        const driver = actor?.getVehicleDriver();
        return driver?.uuid ? [driver.uuid] : [];
    },

    /**
     * Whoever controls an actor: the summoner of a spirit, the technomancer of a sprite, the driver of a vehicle.
     */
    ownerOf(uuid: string): string {
        const actor = FlowRunner.resolveActor(uuid);
        if (!actor) return '';
        if (actor.isType('spirit')) return actor.system.summonerUuid;
        if (actor.isType('sprite')) return actor.system.technomancerUuid;
        if (actor.isType('vehicle')) return actor.system.driver;
        return '';
    },

    /**
     * The actor the current user picked for a step, by targeting its token.
     */
    pickedSubject(): string {
        const [token] = game.user?.targets ?? [];
        return token?.actor?.uuid ?? '';
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

            // Steps waiting on a verdict only run when clicked, gated steps once released.
            if (entry.prompt || entry.gated) continue;

            // Choices are made on the chat message, unless the subject takes an option by itself.
            if (step.kind === 'choice') {
                const option = FlowGates.autoChoice(step, test.actor, FlowRunner.resolveActor(entry.subjectUuid));
                const message = test.data.messageUuid ? fromUuidSync(test.data.messageUuid) as ChatMessage | null : null;
                if (option && message) await FlowGates.choose(message, step.id, entry.subjectUuid, option);
                continue;
            }

            // Defenses the defender can't make resolve right away, for subjects the current user owns.
            if (entry.noDefense === 'forced') {
                const defender = FlowRunner.resolveActor(entry.subjectUuid);
                const message = test.data.messageUuid ? fromUuidSync(test.data.messageUuid) as ChatMessage | null : null;
                if (defender?.isOwner && message) await FlowRunner.executePromptStep(message, step.id, entry.subjectUuid, false, ['noDefense']);
                continue;
            }

            if (FlowRunner.isApplyStep(step)) {
                if (!FlowRunner.autoApplies(step)) continue;
                if (!await FlowRunner.applyStep(test, step, entry)) continue;
                entry.status = 'done';
                const message = test.data.messageUuid ? fromUuidSync(test.data.messageUuid) as ChatMessage | null : null;
                if (message) await FlowRunner.markApplied(message, entry);
                await FlowRunner.continueAfterApply(test, state, step, entry);
                continue;
            }

            if (step.kind !== 'test' || step.mode !== 'auto') continue;

            const actor = FlowRunner.resolveActor(entry.subjectUuid) ?? (step.actor === 'self' ? test.actor : undefined);
            if (!actor?.isOwner) continue;

            await FlowRunner.executeStep(test, step, entry.subjectUuid);
        }
    },

    isApplyStep(step: FlowStep): boolean {
        return step.kind === 'applyDamage' || step.kind === 'applyEffects' || step.kind === 'elemental' || FlowRunner.isResultStep(step);
    },

    /**
     * Results of an action, applied to the actor of their node. See ResultActionData.
     */
    isResultStep(step: FlowStep): boolean {
        return ['modifyCombatantInit', 'forceReboot', 'placeMarks'].includes(step.kind);
    },

    autoApplies(step: FlowStep): boolean {
        // Secondary effects follow the damage once it's applied, however that was.
        if (step.kind === 'elemental') return true;
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

        Hooks.callAll('sr5_flowStepStart', step, { test, actor, entry });
        const applied = await FlowRunner._applyStep(test, step, actor);
        if (applied) Hooks.callAll('sr5_flowStepComplete', step, { test, actor, entry });
        return applied;
    },

    async _applyStep(test: SuccessTest, step: FlowStep, actor: SR5Actor): Promise<boolean> {
        if (step.kind === 'applyDamage') {
            if (!actor.isOwner) return false;
            // Nodes dealing damage of their own apply that, lowered damage steps what the test resulted in.
            const damage = step.damage.mode === 'own' && step.settings.damage
                ? FlowContext.stepDamage(step, test, FlowContext.fromMessage(test.data.messageUuid))
                : FlowRunner.resultDamage(test.data);
            if (!damage) return false;
            await new DamageApplicationFlow().applyDamageToActor(actor, damage);
            return true;
        }

        if (step.kind === 'modifyCombatantInit') {
            const value = Number(step.config.value);
            if (!value) return false;
            await actor.changeCombatInitiative(value);
            return true;
        }

        if (step.kind === 'elemental') {
            if (!actor.isOwner) return false;
            await ElementalRules.applySecondaryEffects(actor, FlowRunner.resultDamage(test.data));
            return true;
        }

        if (step.kind === 'forceReboot') {
            await actor.rebootPersona();
            return true;
        }

        // Marks are placed by the matrix tests themselves, after a successful action. See MarkPlacementFlow.
        if (step.kind === 'placeMarks') return false;

        if (step.kind === 'applyEffects') {
            const message = test.data.messageUuid ? fromUuidSync(test.data.messageUuid) as ChatMessage | null : null;
            const state = message ? FlowRunner.getState(message) : undefined;
            await test.effects.createTargetActorEffects(actor, {
                select: step.config.select as string | undefined,
                ids: step.config.ids as string[] | undefined,
                itemUuid: step.config.itemUuid as string | undefined,
                conditions: step.config.conditions as Record<string, string> | undefined,
                durationFormula: step.config.durationFormula as string | undefined,
                durationUnit: step.config.durationUnit as string | undefined,
                chemical: step.config.chemical as { itemUuid: string, addictionRating: number } | undefined,
                ctx: state?.ctx,
                chainId: state?.chainId,
                messageUuid: test.data.messageUuid,
                exclude: step.config.exclude as string[] | undefined,
            });
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
        if (!state || !entry || !step || entry.status !== 'pending' || !FlowRunner.isApplyStep(step)) return;

        const test = await TestCreator.fromMessage(message.id!);
        if (!test) return;
        await test.populateTests();
        await test.populateDocuments();

        if (!await FlowRunner.applyStep(test, step, entry)) return;
        await FlowRunner.markApplied(message, entry);
        await FlowRunner.continueAfterApply(test, state, step, entry);
    },

    /**
     * Continue with the steps following an applied step, like a test reacting to the applied damage.
     *
     * Apply steps don't create a message of their own. Their following steps are added to the
     * message of the test the apply step followed, as long as the user can update it.
     */
    async continueAfterApply(test: SuccessTest, state: FlowState, step: FlowStep, entry: FlowNextEntry) {
        const children = FlowPlan.children(state.plan, step.id);
        if (!children.length) return;

        const actor = FlowRunner.resolveActor(entry.subjectUuid);
        const damage = FlowRunner.testDamage(test);
        const entries: FlowNextEntry[] = children.map(child => ({
            stepId: child.id,
            subjectUuid: child.actor === 'self' ? state.rootActorUuid : entry.subjectUuid,
            status: FlowPlan.allows({ step: child, actor, damage, outcome: ['always'] }) ? 'pending' : 'skipped',
        }));

        const message = test.data.messageUuid ? fromUuidSync(test.data.messageUuid) as ChatMessage | null : null;
        const current = message ? FlowRunner.getState(message) : undefined;
        if (message && current && game.user && message.canUserModify(game.user, 'update')) {
            await message.setFlag(SYSTEM_NAME, FLAGS.Flow, { ...current, next: [...current.next, ...entries] });
        }

        await FlowRunner.runNext(test, { ...state, next: entries });
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
     * Execute a test step directly following the given test, for the given subject.
     */
    async executeStep(parent: SuccessTest, step: FlowStep, subjectUuid = '') {
        Hooks.callAll('sr5_flowStepStart', step, { test: parent, subjectUuid });

        // Following the root test for its caster, like drain. Test classes may warn about it first.
        if (step.actor === 'self' && step.after === FLOW_ROOT_STEP) {
            await parent.executeFollowUpTest(step.test, step.features);
            return;
        }

        const test = await FlowRunner.createStepTest(parent, step, subjectUuid);
        if (!test) {
            console.warn(`Shadowrun 5e | Flow step ${step.id} can't be executed after a ${parent.type}`, step);
            return;
        }

        test.data.features = [...(test.data.features ?? []), ...step.features.filter(feature => !test.data.features?.includes(feature))];
        await test.execute();
    },

    /**
     * Create the test of a step, using the data path its test class knows for that position in a chain.
     */
    async createStepTest(parent: SuccessTest, step: FlowStep, subjectUuid: string): Promise<SuccessTest | undefined> {
        const options = parent.data.options;

        // Resisting what an opposing test let through.
        if (parent.opposing && step.relation === 'resist') {
            return TestCreator.fromOpposedTestResistTest(parent as OpposedTest, options, step.test);
        }

        const subject = FlowRunner.resolveActor(subjectUuid)
            ?? (step.actor === 'self' || step.actor === 'none' ? FlowRunner.resolveActor(parent.data.sourceActorUuid ?? '') : parent.actor);
        if (!subject) return undefined;

        // Opposing the test it follows, for one of its targets.
        if (step.relation === 'opposed') {
            const testCls = TestCreator._getTestClass(step.test);
            const messageId = parent.data.messageUuid ? (fromUuidSync(parent.data.messageUuid) as ChatMessage | null)?.id : undefined;
            if (!testCls || !messageId) return undefined;
            const data = await testCls._getOpposedActionTestData(foundry.utils.deepClone(parent.data), subject, messageId);
            if (!data) return undefined;
            return new testCls(data, { source: subject }, options);
        }

        return TestCreator.fromStep(parent, step, subject, options);
    },

    /**
     * Execute a step following the root test of a message for the given subject.
     *
     * @param message The message holding the root test.
     * @param stepId The step to execute.
     * @param subjectUuid The actor or token to execute the step for.
     * @param showDialog Show the test dialog.
     * @param features Feature changes for the test, like not defending at all.
     */
    async executePromptStep(message: ChatMessage, stepId: string, subjectUuid: string, showDialog = true, features: string[] = []) {
        const state = FlowRunner.getState(message);
        const step = state ? FlowPlan.step(state.plan, stepId) : undefined;
        const entry = state?.next.find(entry => entry.stepId === step?.id && entry.subjectUuid === subjectUuid);
        if (!state || !step || !FlowRunner.canPromptStep(step, entry)) return;
        if (step.roller === 'gm' && !game.user?.isGM) return;

        if (entry?.pick) {
            subjectUuid = FlowRunner.pickedSubject();
            if (!subjectUuid) {
                ui.notifications?.warn('SR5.Flow.PickTargetFirst', { localize: true });
                return;
            }
        }

        // Steps other than defenses are created the way the runner creates them, following the root test.
        if (step.relation !== 'opposed') {
            const root = await TestCreator.fromMessage(message.id!, { showDialog });
            if (!root) return;
            await root.populateDocuments();
            await FlowRunner.executeStep(root, step, subjectUuid);
            return;
        }

        const testCls = TestCreator._getTestClass(step.test);
        const actor = FlowRunner.resolveActor(subjectUuid);
        // A defense below a defense defends against the primary test, like when a missed shot hits someone else.
        const against = step.config.against === 'primary' && state.primaryMessageUuid
            ? fromUuidSync(state.primaryMessageUuid) as ChatMessage | null : message;
        const testData = against?.getFlag(SYSTEM_NAME, FLAGS.Test) as { data?: SuccessTest['data'] } | undefined;
        if (!testCls || !actor || !testData?.data) return;

        const againstData = foundry.utils.deepClone(testData.data);
        const data = await testCls._getOpposedActionTestData(againstData, actor, message.id!);
        if (!data) return;
        data.features = [...step.features, ...features];

        const test = new testCls(data, { source: actor }, { showDialog });
        await test.execute();
    },

    /**
     * Only opposing test steps following the root test and using the default actor selection can be cast
     * for a single subject. Other test implementations select their actors themselves.
     */
    canPromptStep(step: FlowStep, entry?: FlowNextEntry): boolean {
        if (step.kind !== 'test' || (step.mode !== 'prompt' && !entry?.prompt)) return false;
        if (entry?.gated) return false;
        // Steps other than the defenses of the root are started for their subject.
        if (step.after !== FLOW_ROOT_STEP || step.relation !== 'opposed') return true;
        if (step.actor !== 'target' && step.actor !== 'none') return false;

        // Defense test implementations selecting their actors themselves keep their own button.
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
