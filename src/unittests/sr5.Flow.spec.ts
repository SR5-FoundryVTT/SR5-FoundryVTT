import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { SR5TestFactory } from './utils';
import { TestCreator } from '../module/tests/TestCreator';
import { SuccessTest } from '../module/tests/SuccessTest';
import { RangedAttackTest } from '../module/tests/RangedAttackTest';
import { FlowSnapshot } from '../module/tests/flows/FlowSnapshot';
import { FlowTree } from '../module/flows/FlowTree';
import { FlowPlan } from '../module/flows/FlowPlan';
import { FlowRunner } from '../module/flows/FlowRunner';
import { FlowChatFlow } from '../module/flows/FlowChatFlow';
import { PhysicalDefenseTest } from '../module/tests/PhysicalDefenseTest';
import { FLAGS, SYSTEM_NAME } from '../module/constants';
import { SR5Actor } from '../module/actor/SR5Actor';
import { createFlowStep, FLOW_ROOT_STEP, FlowState, FlowStep } from '../module/types/flows/FlowStep';

// Step ids are node paths within the action.
const STEP = {
    defense: 'opposed',
    resist: 'opposed.resist',
    damage: 'opposed.resist.damage',
    hitDamage: 'opposed.damage',
    effects: 'opposed.effects',
    followup: 'followed',
    drain: 'followed.damage',
} as const;

export const shadowrunFlowTesting = (context: QuenchBatchContext) => {
    const factory = new SR5TestFactory();
    const { describe, it, before, after } = context;
    const assert: Chai.AssertStatic = context.assert;

    after(async function () {
        // Deleting all actors created here takes longer than a single test may.
        this.timeout(30000);
        await factory.destroy();
    });

    const stepById = (steps: FlowStep[], id: string) => steps.find(step => step.id === id);

    const createWeaponTest = async (action: Record<string, unknown>, category: 'melee' | 'range' = 'melee') => {
        const actor = await factory.createActor({ type: 'character' });
        const [weapon] = await actor.createEmbeddedDocuments('Item', [{
            name: 'Flow Weapon',
            type: 'weapon',
            system: { category, action, technology: { equipped: true } },
        }]);
        const test = await TestCreator.fromItem(weapon, actor, { showDialog: false, showMessage: false });
        if (!test) throw new Error('Failed to create weapon test');
        return test;
    };

    const createActionTest = async (action: Record<string, unknown>) => {
        const actor = await factory.createActor({ type: 'character' });
        const [item] = await actor.createEmbeddedDocuments('Item', [{ name: 'Flow Action', type: 'action', system: { action } }]);
        const test = await TestCreator.fromItem(item, actor, { showDialog: false, showMessage: false });
        if (!test) throw new Error('Failed to create action test');
        return test;
    };

    describe('FlowSnapshot', () => {
        const chain = () => ({
            type: 'BiofeedbackResistTest',
            flow: { stepId: 'biofeedback' },
            following: {
                type: 'MatrixResistTest',
                following: {
                    type: 'MatrixDefenseTest',
                    against: { type: 'MatrixTest', against: { type: 'deeper' } },
                },
            },
        });

        it('drops all nested test data at depth 0', () => {
            const pruned = FlowSnapshot.prune(chain(), 0);
            assert.isUndefined(pruned.following);
            assert.isUndefined(pruned.flow);
            assert.strictEqual(FlowSnapshot.depth(pruned), 0);
        });

        it('keeps nested test data up to the given depth', () => {
            const pruned = FlowSnapshot.prune(chain(), 1) as any;
            assert.strictEqual(pruned.following.type, 'MatrixResistTest');
            assert.isUndefined(pruned.following.following);
            assert.strictEqual(FlowSnapshot.depth(pruned), 1);
        });

        it('does not alter the given data', () => {
            const data = chain();
            FlowSnapshot.prune(data, 0);
            assert.strictEqual(FlowSnapshot.depth(data), 4);
            assert.exists(data.flow);
        });
    });

    describe('FlowTree', () => {
        it('maps a weapon attack to defense, resist and damage', async () => {
            const test = await createWeaponTest({
                test: 'MeleeAttackTest',
                opposed: { test: 'PhysicalDefenseTest', resist: { test: 'PhysicalResistTest' } },
            });

            const steps = FlowTree.flatten(test);

            // Secondary effects of elemental damage follow the damage, see ElementalRules.
            assert.deepEqual(steps.map(step => step.id), [STEP.defense, STEP.resist, STEP.damage, `${STEP.damage}.elemental`]);
            assert.strictEqual(stepById(steps, STEP.defense)?.test, 'PhysicalDefenseTest');
            assert.strictEqual(stepById(steps, STEP.defense)?.after, FLOW_ROOT_STEP);

            const resist = stepById(steps, STEP.resist);
            assert.strictEqual(resist?.after, STEP.defense);
            assert.deepEqual(resist?.when, ['hit']);
            assert.strictEqual(resist?.mode, 'auto');

            const damage = stepById(steps, STEP.damage);
            assert.strictEqual(damage?.kind, 'applyDamage');
            assert.strictEqual(damage?.after, STEP.resist);
        });

        it('reads a defense test configured as resist test as physical resist', async () => {
            const test = await createWeaponTest({
                test: 'MeleeAttackTest',
                opposed: { test: 'PhysicalDefenseTest', resist: { test: 'PhysicalDefenseTest' } },
            });

            const steps = FlowTree.flatten(test);

            assert.strictEqual(stepById(steps, STEP.resist)?.test, 'PhysicalResistTest');
        });

        it('uses the suppression defense test for suppressive fire', async () => {
            const test = await createWeaponTest({
                test: 'RangedAttackTest',
                opposed: { test: 'PhysicalDefenseTest', resist: { test: 'PhysicalResistTest' } },
            }, 'range');
            assert.instanceOf(test, RangedAttackTest);
            (test as RangedAttackTest).data.fireMode = { ...(test as RangedAttackTest).data.fireMode, suppression: true };

            const steps = FlowTree.flatten(test);

            assert.strictEqual(stepById(steps, STEP.defense)?.test, 'SuppressionDefenseTest');
        });

        it('applies damage after the defense when there is no resist test', async () => {
            const test = await createActionTest({
                test: 'SuccessTest',
                opposed: { test: 'CombatSpellDefenseTest', resist: { test: '' } },
            });
            test.data.damage.value = 6;

            const steps = FlowTree.flatten(test);
            const damage = stepById(steps, STEP.hitDamage);

            assert.isUndefined(stepById(steps, STEP.resist));
            assert.strictEqual(damage?.after, STEP.defense);
            assert.deepEqual(damage?.when, ['hit']);
        });

        it('maps a followed test to a followup and drain step for the casting actor', async () => {
            const test = await createActionTest({ test: 'SuccessTest', opposed: { test: '' }, followed: { test: 'DrainTest' } });

            const steps = FlowTree.flatten(test);
            const followup = stepById(steps, STEP.followup);

            assert.deepEqual(steps.map(step => step.id), [STEP.followup, STEP.drain, `${STEP.drain}.elemental`]);
            assert.strictEqual(followup?.test, 'DrainTest');
            assert.strictEqual(followup?.actor, 'self');
            assert.strictEqual(followup?.mode, 'auto');
            assert.strictEqual(stepById(steps, STEP.drain)?.actor, 'self');
        });

        it('maps nothing for a test without opposed or followed test', async () => {
            const test = TestCreator.fromPool({ pool: 5 }, { showDialog: false, showMessage: false });
            assert.deepEqual(FlowTree.flatten(test), []);
        });
    });

    describe('FlowRunner recording', () => {
        const createdMessageIds: string[] = [];
        let hookId: number;

        before(() => {
            hookId = Hooks.on('createChatMessage', (message: ChatMessage) => { createdMessageIds.push(message.id!); });
        });

        after(async function () {
            this.timeout(30000);
            Hooks.off('createChatMessage', hookId);
            const ids = createdMessageIds.filter(id => game.messages?.has(id));
            if (ids.length) await ChatMessage.deleteDocuments(ids);
        });

        const flowState = (uuid: string | undefined) => {
            const message = uuid ? fromUuidSync(uuid) as ChatMessage : undefined;
            return message?.getFlag(SYSTEM_NAME, FLAGS.Flow) as FlowState | undefined;
        };

        const options = { showDialog: false, showMessage: true };

        const createAttack = async (testOptions = options, { damage = 6, effect = false } = {}) => {
            const attacker = await factory.createActor({ type: 'character' });
            const defender = await factory.createActor({ type: 'character' });
            const [weapon] = await attacker.createEmbeddedDocuments('Item', [{
                name: 'Flow Weapon',
                type: 'weapon',
                system: {
                    category: 'melee',
                    action: {
                        test: 'MeleeAttackTest',
                        opposed: { test: 'PhysicalDefenseTest', resist: { test: 'PhysicalResistTest' } },
                        damage: { base: damage, value: damage, type: { base: 'physical', value: 'physical' } },
                    },
                    technology: { equipped: true },
                },
            }]);
            if (effect) {
                await weapon.createEmbeddedDocuments('ActiveEffect', [{
                    name: 'Flow Effect',
                    system: {
                        targets: [{ id: 't', applyTo: 'targeted_actor' }],
                        changes: [{ key: 'system.modifiers.global', value: '-1', type: 'add', target: 't' }],
                    },
                }]);
            }
            const attack = await TestCreator.fromItem(weapon, attacker, testOptions);
            if (!attack) throw new Error('Failed to create attack test');
            attack.data.targetUuids = [defender.uuid];
            return { attack, defender };
        };

        it('records the root test with one defense step per target', async () => {
            const { attack, defender } = await createAttack();
            await attack.execute();

            const state = flowState(attack.data.messageUuid);
            if (!state) return assert.fail('Root message has no flow state');

            assert.strictEqual(state.stepId, FLOW_ROOT_STEP);
            assert.strictEqual(state.rootMessageUuid, attack.data.messageUuid);
            assert.deepEqual(state.targets, [defender.uuid]);
            assert.deepEqual(state.next, [{ stepId: STEP.defense, subjectUuid: defender.uuid, branchUuid: defender.uuid, status: 'pending' }]);
        });

        const executeDefense = async (attackHits: boolean, attackOptions: { damage?: number, effect?: boolean } = {}) => {
            const { attack, defender } = await createAttack(options, attackOptions);
            await attack.execute();
            const rootMessage = fromUuidSync(attack.data.messageUuid!) as ChatMessage;

            const defenseData = await PhysicalDefenseTest._getOpposedActionTestData(attack.data, defender, rootMessage.id!);
            if (!defenseData) throw new Error('Failed to create defense test data');
            const defense = new PhysicalDefenseTest(defenseData, { actor: defender, source: defender }, options);
            // Force the defense result, as it'd otherwise depend on dice.
            Object.defineProperty(defense, 'success', { get: () => !attackHits });
            Object.defineProperty(defense, 'failure', { get: () => attackHits });
            await defense.execute();

            return { attack, defender, defense, rootState: flowState(attack.data.messageUuid)! };
        };

        it('records a defense test as step of the attacks chain', async () => {
            const { attack, defender, defense, rootState } = await executeDefense(false);

            const state = flowState(defense.data.messageUuid);
            if (!state) return assert.fail('Defense message has no flow state');

            assert.strictEqual(state.stepId, STEP.defense);
            assert.strictEqual(state.chainId, rootState.chainId);
            assert.strictEqual(state.parentMessageUuid, attack.data.messageUuid);
            assert.strictEqual(state.subjectUuid, defender.uuid);
            assert.deepEqual(state.next, [{ stepId: STEP.resist, subjectUuid: defender.uuid, branchUuid: defender.uuid, status: 'skipped' }]);
        });

        it('records the resist test following a failed defense', async () => {
            const { defender, defense, rootState } = await executeDefense(true);

            // A failed defense auto executes the resist test, which follows the defense message.
            const resistMessage = game.messages!.contents.findLast(message => {
                const resistState = message.getFlag(SYSTEM_NAME, FLAGS.Flow) as FlowState | undefined;
                return resistState?.chainId === rootState.chainId && resistState.stepId === STEP.resist;
            });
            const resistState = resistMessage?.getFlag(SYSTEM_NAME, FLAGS.Flow) as FlowState | undefined;
            if (!resistState) return assert.fail('Resist message has no flow state');

            assert.strictEqual(resistState.parentMessageUuid, defense.data.messageUuid);
            assert.strictEqual(resistState.subjectUuid, defender.uuid);
            assert.deepEqual(resistState.next, [{ stepId: STEP.damage, subjectUuid: defender.uuid, branchUuid: defender.uuid, status: 'pending' }]);

            const state = flowState(defense.data.messageUuid);
            assert.deepEqual(state?.next, [{
                stepId: STEP.resist,
                subjectUuid: defender.uuid,
                branchUuid: defender.uuid,
                status: 'done',
                messageUuid: resistMessage!.uuid,
            }]);
        });

        const findChainMessage = (chainId: string, stepId: string) => game.messages!.contents.findLast(message => {
            const state = message.getFlag(SYSTEM_NAME, FLAGS.Flow) as FlowState | undefined;
            return state?.chainId === chainId && state.stepId === stepId;
        });

        const withAutoApply = async (value: 'none' | 'effects' | 'all', callback: () => Promise<void>) => {
            const previous = game.settings.get(SYSTEM_NAME, FLAGS.FlowAutoApply);
            await game.settings.set(SYSTEM_NAME, FLAGS.FlowAutoApply, value);
            try {
                await callback();
            } finally {
                await game.settings.set(SYSTEM_NAME, FLAGS.FlowAutoApply, previous);
            }
        };

        const takenDamage = (actor: SR5Actor) => {
            const character = actor.asType('character');
            if (!character) throw new Error('Expected a character actor');
            return character.system.track.physical.value + character.system.track.stun.value;
        };

        it('applies targeted effects to a hit defender, starting their duration when applied', async () => {
            await withAutoApply('effects', async () => {
                const { defender, defense } = await executeDefense(true, { effect: true });

                const effect = defender.effects.find(effect => effect.name === 'Flow Effect');
                if (!effect) return assert.fail('Targeted effect was not applied');
                assert.strictEqual(effect.start?.time, game.time.worldTime);

                const effectsEntry = flowState(defense.data.messageUuid)?.next.find(entry => entry.stepId === STEP.effects);
                assert.strictEqual(effectsEntry?.status, 'done');
            });
        });

        it('applies damage after resisting when auto applying everything', async () => {
            await withAutoApply('all', async () => {
                const { defender, rootState } = await executeDefense(true, { damage: 30 });

                const resistState = findChainMessage(rootState.chainId, STEP.resist)?.getFlag(SYSTEM_NAME, FLAGS.Flow) as FlowState | undefined;
                assert.strictEqual(resistState?.next[0]?.status, 'done');
                assert.isAbove(takenDamage(defender), 0);
            });
        });

        it('waits for the apply button without auto applying damage', async () => {
            await withAutoApply('none', async () => {
                const { defender, rootState } = await executeDefense(true, { damage: 30 });
                const resistMessage = findChainMessage(rootState.chainId, STEP.resist);
                if (!resistMessage) return assert.fail('Resist message missing');

                assert.strictEqual(takenDamage(defender), 0);
                const [row] = FlowChatFlow.applyRows(resistMessage);
                assert.strictEqual(row?.subjectUuid, defender.uuid);
                assert.isTrue(row?.isPending);

                await FlowRunner.applyPromptEntry(resistMessage, STEP.damage, defender.uuid);

                assert.isAbove(takenDamage(defender), 0);
                const [appliedRow] = FlowChatFlow.applyRows(resistMessage);
                assert.isFalse(appliedRow?.isPending);
            });
        });

        /**
         * Collect the type of every test completing while the callback runs.
         */
        const completedTests = async (callback: () => Promise<unknown>) => {
            const types: string[] = [];
            const id = Hooks.on('sr5_afterTestComplete', (test: SuccessTest) => { types.push(test.type); });
            try {
                await callback();
            } finally {
                Hooks.off('sr5_afterTestComplete', id);
            }
            return types;
        };

        it('resists a hit without any chat messages', async () => {
            const noMessage = { showDialog: false, showMessage: false };
            const { attack, defender } = await createAttack(noMessage);
            await attack.execute();

            const defenseData = await PhysicalDefenseTest._getOpposedActionTestData(attack.data, defender, '');
            if (!defenseData) return assert.fail('Failed to create defense test data');
            const defense = new PhysicalDefenseTest(defenseData, { actor: defender, source: defender }, noMessage);
            Object.defineProperty(defense, 'success', { get: () => false });
            Object.defineProperty(defense, 'failure', { get: () => true });

            const types = await completedTests(() => defense.execute());

            assert.deepEqual(types, ['PhysicalResistTest', 'PhysicalDefenseTest']);
        });

        it('does not resist an attack without damage', async () => {
            const { attack, defender } = await createAttack();
            await attack.execute();
            const rootMessage = fromUuidSync(attack.data.messageUuid!) as ChatMessage;

            const defenseData = await PhysicalDefenseTest._getOpposedActionTestData(attack.data, defender, rootMessage.id!);
            if (!defenseData) return assert.fail('Failed to create defense test data');
            const defense = new PhysicalDefenseTest(defenseData, { actor: defender, source: defender }, options);
            Object.defineProperty(defense, 'success', { get: () => false });
            Object.defineProperty(defense, 'failure', { get: () => true });
            Object.defineProperty(defense, 'getNoDamageCondition', {
                value: () => ({ test: () => true, label: 'SR5.TestResults.AttackDoesNoPhysicalDamageToVehicle' }),
            });

            const types = await completedTests(() => defense.execute());

            assert.deepEqual(types, ['PhysicalDefenseTest']);
            assert.strictEqual(flowState(defense.data.messageUuid)?.next[0]?.status, 'skipped');
        });

        it('executes a defense from the root message and marks it as done', async () => {
            const { attack, defender } = await createAttack();
            await attack.execute();
            const rootMessage = fromUuidSync(attack.data.messageUuid!) as ChatMessage;

            const [row] = FlowChatFlow.rows(rootMessage);
            assert.strictEqual(row?.subjectUuid, defender.uuid);
            assert.isTrue(row?.isPending);
            assert.isTrue(row?.canExecute);

            const types = await completedTests(() => FlowRunner.executePromptStep(rootMessage, STEP.defense, defender.uuid, false));

            assert.strictEqual(types.at(-1), 'PhysicalDefenseTest');
            const [doneRow] = FlowChatFlow.rows(rootMessage);
            assert.isTrue(doneRow?.isDone);
        });

        it('continues the chain for a defending actor that was not targeted', async () => {
            const { attack } = await createAttack();
            await attack.execute();
            const rootMessage = fromUuidSync(attack.data.messageUuid!) as ChatMessage;
            const bystander = await factory.createActor({ type: 'character' });

            const defenseData = await PhysicalDefenseTest._getOpposedActionTestData(attack.data, bystander, rootMessage.id!);
            if (!defenseData) return assert.fail('Failed to create defense test data');
            const defense = new PhysicalDefenseTest(defenseData, { actor: bystander, source: bystander }, options);
            await defense.execute();

            const state = flowState(defense.data.messageUuid);
            assert.strictEqual(state?.stepId, STEP.defense);
            assert.strictEqual(state?.subjectUuid, bystander.uuid);

            const rootNext = flowState(attack.data.messageUuid)?.next ?? [];
            assert.deepInclude(rootNext, { stepId: STEP.defense, subjectUuid: bystander.uuid, status: 'done', messageUuid: defense.data.messageUuid });
        });

        it('executes the drain of a spell after casting it', async () => {
            const actor = await factory.createActor({ type: 'character', system: { attributes: { magic: { base: 6 } } } });
            const [spell] = await actor.createEmbeddedDocuments('Item', [{
                name: 'Flow Spell',
                type: 'spell',
                system: { category: 'health', drain: 2, action: { test: 'SpellCastingTest', followed: { test: 'DrainTest' } } },
            }]);
            const test = await TestCreator.fromItem(spell, actor, options);
            if (!test) return assert.fail('Failed to create spell test');

            const types = await completedTests(() => test.execute());

            assert.deepEqual(types, ['DrainTest', 'SpellCastingTest']);
        });

        it('does not record tests without steps following them', async () => {
            const test = TestCreator.fromPool({ pool: 2 }, options);
            await test.execute();

            assert.isUndefined(flowState(test.data.messageUuid));
        });

        it('matches a test to its step by type, falling back to the only remaining test step', () => {
            const parent = {
                plan: [
                    createFlowStep({ id: 'defense', test: 'PhysicalDefenseTest' }),
                    createFlowStep({ id: 'damage', kind: 'applyDamage' }),
                ],
                next: [
                    { stepId: 'defense', subjectUuid: '', status: 'pending' },
                    { stepId: 'damage', subjectUuid: '', status: 'pending' },
                ],
            } as unknown as FlowState;

            const defense = { type: 'PhysicalDefenseTest', actor: undefined } as unknown as SuccessTest;
            const replaced = { type: 'SuppressionDefenseTest', actor: undefined } as unknown as SuccessTest;

            assert.strictEqual(FlowRunner.matchNextEntry(defense, parent)?.stepId, 'defense');
            assert.strictEqual(FlowRunner.matchNextEntry(replaced, parent)?.stepId, 'defense');
        });
    });

    describe('FlowPlan', () => {
        it('flattens nested nodes below the legacy nodes, attaching after the damage their parent applies', async () => {
            const test = await createWeaponTest({
                test: 'MeleeAttackTest',
                opposed: {
                    test: 'PhysicalDefenseTest',
                    resist: { test: 'PhysicalResistTest', followed: { test: 'SuccessTest' } },
                    followed: { test: 'PhysicalResistTest', actor: 'other', when: ['hit'], damage: { base: 4, value: 4, type: { base: 'stun', value: 'stun' } } },
                },
            });

            const plan = FlowPlan.resolve(test);
            const ids = plan.map(step => step.id);

            assert.includeMembers(ids, ['opposed', 'opposed.resist', 'opposed.resist.damage', 'opposed.resist.damage', 'opposed.resist.followed', 'opposed.followed']);
            // The resist test of the defender is followed by a test of the defender, after the damage is applied.
            assert.strictEqual(stepById(plan, 'opposed.resist.followed')?.after, 'opposed.resist.damage');
            assert.strictEqual(stepById(plan, 'opposed.resist.followed')?.actor, 'target');
            // A node of the other actor below the defense is the attacker again.
            assert.strictEqual(stepById(plan, 'opposed.followed')?.actor, 'self');
            assert.deepEqual(stepById(plan, 'opposed.followed')?.when, ['hit']);
        });

        it('resolves steps by their legacy ids', async () => {
            const test = await createWeaponTest({
                test: 'MeleeAttackTest',
                opposed: { test: 'PhysicalDefenseTest', resist: { test: 'PhysicalResistTest' } },
            });
            const plan = FlowPlan.resolve(test);

            assert.strictEqual(FlowPlan.step(plan, 'defense')?.id, 'opposed');
            assert.strictEqual(FlowPlan.step(plan, 'damage')?.id, 'opposed.resist.damage');
        });

        it('takes defaults from the relation preset', async () => {
            const test = await createActionTest({ test: 'SuccessTest', resist: { test: 'PhysicalResistTest' } });
            const plan = FlowPlan.resolve(test);

            // A resist directly below the root is rolled by each target on success.
            const resist = stepById(plan, 'resist');
            assert.strictEqual(resist?.actor, 'target');
            assert.deepEqual(resist?.when, ['success']);
            assert.strictEqual(resist?.mode, 'auto');
            assert.strictEqual(stepById(plan, 'resist.damage')?.after, 'resist');
        });

        it('selects direct children of a step', () => {
            const plan = [
                createFlowStep({ id: 'a' }),
                createFlowStep({ id: 'b', after: 'a' }),
                createFlowStep({ id: 'c', after: 'a' }),
            ];
            assert.deepEqual(FlowPlan.children(plan, 'a').map(step => step.id), ['b', 'c']);
            assert.deepEqual(FlowPlan.children(plan, FLOW_ROOT_STEP).map(step => step.id), ['a']);
        });

        it('matches when against the parent test result', () => {
            const succeeded = { success: true, failure: false } as SuccessTest;
            const failed = { success: false, failure: true } as SuccessTest;

            assert.isTrue(FlowPlan.matchesWhen(createFlowStep({ id: 's', when: ['hit'] }), failed));
            assert.isFalse(FlowPlan.matchesWhen(createFlowStep({ id: 's', when: ['hit'] }), succeeded));
            assert.isTrue(FlowPlan.matchesWhen(createFlowStep({ id: 's', when: ['success'] }), succeeded));
            assert.isTrue(FlowPlan.matchesWhen(createFlowStep({ id: 's', when: ['always'] })));
            assert.isTrue(FlowPlan.matchesWhen(createFlowStep({ id: 's' })));
            assert.isFalse(FlowPlan.matchesWhen(createFlowStep({ id: 's', when: ['success'] })));
            // Any of the listed outcomes allows the step.
            assert.isTrue(FlowPlan.matchesWhen(createFlowStep({ id: 's', when: ['tie', 'hit'] }), failed));
            // A recorded outcome replaces reading the test.
            assert.isTrue(FlowPlan.matchesWhen(createFlowStep({ id: 's', when: ['hit'] }), undefined, ['hit']));
        });

        it('does not allow steps with unknown conditions', () => {
            const step = createFlowStep({ id: 's', condition: 'doesNotExist' });
            assert.isFalse(FlowPlan.matchesCondition({ step }));
        });

        it('lets the parent test veto a step', () => {
            const step = createFlowStep({ id: 's' });
            const test = { success: true, failure: false, flowAllowsStep: () => false } as unknown as SuccessTest;
            assert.isFalse(FlowPlan.allows({ step, test }));
        });
    });
};
