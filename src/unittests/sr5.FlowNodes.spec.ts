import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { SR5TestFactory } from './utils';
import { TestCreator } from '@/module/tests/TestCreator';
import { OpposedTest } from '@/module/tests/OpposedTest';
import { PhysicalDefenseTest } from '@/module/tests/PhysicalDefenseTest';
import { FlowConditions, FlowPlan } from '@/module/flows/FlowPlan';
import { FlowRunner } from '@/module/flows/FlowRunner';
import { FlowContext } from '@/module/flows/FlowContext';
import { FlowGates } from '@/module/flows/FlowGates';
import { FlowChemicals } from '@/module/flows/FlowContributors';
import { ToxinResistTest } from '@/module/tests/ToxinResistTest';
import { DamageRules } from '@/module/rules/DamageRules';
import { FLAGS, SYSTEM_NAME } from '@/module/constants';
import { createFlowStep, FlowState } from '@/module/types/flows/FlowStep';
import type { SR5Actor } from '@/module/actor/SR5Actor';
import type { SuccessTest } from '@/module/tests/SuccessTest';
import type { SR5Item } from '@/module/item/SR5Item';

/**
 * Action node settings and how the flow runs them. SR5 page references name the rules covered.
 */
export const shadowrunFlowNodes = (context: QuenchBatchContext) => {
    const factory = new SR5TestFactory();
    const { describe, it, after } = context;
    const assert: Chai.AssertStatic = context.assert;

    const createdMessageIds: string[] = [];
    const hookId = Hooks.on('createChatMessage', (message: ChatMessage) => { createdMessageIds.push(message.id!); });

    after(async function () {
        // Deleting all actors and messages created here takes longer than a single test may.
        this.timeout(30000);
        Hooks.off('createChatMessage', hookId);
        const ids = createdMessageIds.filter(id => game.messages?.has(id));
        if (ids.length) await ChatMessage.deleteDocuments(ids);
        await factory.destroy();
    });

    const flowState = (uuid: string | undefined) => {
        const message = uuid ? fromUuidSync(uuid) as ChatMessage : undefined;
        return message?.getFlag(SYSTEM_NAME, FLAGS.Flow) as FlowState | undefined;
    };

    /**
     * An equipment item of the given rating with the given action, owned by a new character.
     */
    const equipmentTest = async (action: Record<string, unknown>, options = { showDialog: false, showMessage: false }) => {
        const actor = await factory.createActor({ type: 'character' });
        const [item] = await actor.createEmbeddedDocuments('Item', [{
            name: 'Node Equipment',
            type: 'equipment',
            system: { technology: { rating: 3 }, action: { test: 'SuccessTest', ...action } },
        }]);
        const test = await TestCreator.fromItem(item, actor, options);
        if (!test) throw new Error('Failed to create test');
        return { actor, item, test };
    };

    const takenDamage = (actor: SR5Actor) => {
        const character = actor.asType('character');
        if (!character) throw new Error('Expected a character actor');
        return character.system.track.physical.value + character.system.track.stun.value;
    };

    describe('Formulas', () => {
        it('replaces the opposing pool with a formula, as Force or Rating x 2 oppositions do (SR5#238, SR5#300)', async () => {
            const { test } = await equipmentTest({ opposed: { test: 'OpposedTest', pool: { formula: '@item.rating * 2' } } });
            await test.execute();
            const defender = await factory.createActor({ type: 'character' });

            const data = await OpposedTest._getOpposedActionTestData(test.data, defender, '');
            if (!data) return assert.fail('No opposed test data');
            const opposed = new OpposedTest(data, { source: defender }, { showDialog: false, showMessage: false });

            assert.strictEqual(opposed.pool.value, 6);
        });

        it('replaces the threshold with a formula, as Medkit Rating + 2 does', async () => {
            const { test } = await equipmentTest({ threshold: { base: 0, value: 0, formula: '@item.rating + 2' } });
            assert.strictEqual(test.threshold.value, 5);
        });

        it('rolls dice in a formula once', () => {
            const value = FlowContext.resolve('10 * 1d6', {});
            assert.isNumber(value);
            assert.isTrue(value! >= 10 && value! <= 60 && value! % 10 === 0);
        });

        it('leaves invalid formulas unresolved', () => {
            assert.isUndefined(FlowContext.resolve('@does.not.exist * 2', {}));
            assert.isUndefined(FlowContext.resolve('', {}));
        });
    });

    describe('Nodes without an actor', () => {
        it('are rolled once with the casters documents', async () => {
            const { actor, test } = await equipmentTest({ opposed: { test: 'OpposedTest', actor: 'none', roller: 'gm', pool: { formula: '6' } } });
            const plan = FlowPlan.resolve(test);
            const opposed = FlowPlan.step(plan, 'opposed');

            assert.strictEqual(opposed?.actor, 'none');
            assert.strictEqual(opposed?.roller, 'gm');
            const state = { stepId: 'root', rootActorUuid: actor.uuid, targets: ['a', 'b'] } as unknown as FlowState;
            assert.deepEqual(FlowRunner.stepSubjects(opposed!, state), [actor.uuid]);
        });
    });

    describe('Tests without a verdict', () => {
        it('leave steps waiting for a success to the users', async () => {
            const { test } = await equipmentTest({ resist: { test: 'PhysicalResistTest' } }, { showDialog: false, showMessage: true });
            await test.execute();

            const entry = flowState(test.data.messageUuid)?.next.find(entry => entry.stepId === 'resist');
            assert.isTrue(entry?.prompt);
            assert.strictEqual(entry?.status, 'pending');
        });

        it('run steps on a success automatically when the test has a threshold', async () => {
            const { test } = await equipmentTest({ threshold: { base: 1, value: 1 }, resist: { test: 'PhysicalResistTest' } }, { showDialog: false, showMessage: true });
            Object.defineProperty(test, 'success', { get: () => true });
            await test.execute();

            const entry = flowState(test.data.messageUuid)?.next.find(entry => entry.stepId === 'resist');
            assert.isUndefined(entry?.prompt);
        });
    });

    describe('No defense (SR5#190)', () => {
        const weaponAttack = async (opposed: Record<string, unknown> = {}, testOptions = { showDialog: false, showMessage: false }) => {
            const attacker = await factory.createActor({ type: 'character' });
            const [weapon] = await attacker.createEmbeddedDocuments('Item', [{
                name: 'Node Weapon',
                type: 'weapon',
                system: {
                    category: 'melee',
                    action: {
                        test: 'MeleeAttackTest',
                        opposed: { test: 'PhysicalDefenseTest', resist: { test: 'PhysicalResistTest' }, ...opposed },
                        damage: { base: 4, value: 4, type: { base: 'physical', value: 'physical' } },
                    },
                    technology: { equipped: true },
                },
            }]);
            const attack = await TestCreator.fromItem(weapon, attacker, testOptions);
            if (!attack) throw new Error('Failed to create attack');
            return { attacker, attack };
        };

        const skippedDefense = async (attackHits: number) => {
            const { attack } = await weaponAttack();
            await attack.execute();
            attack.data.values.hits.value = attackHits;
            attack.data.values.netHits.value = attackHits;

            const defender = await factory.createActor({ type: 'character' });
            const data = await PhysicalDefenseTest._getOpposedActionTestData(attack.data, defender, '');
            if (!data) throw new Error('No defense test data');
            data.features = ['noDefense'];
            const defense = new PhysicalDefenseTest(data, { actor: defender, source: defender }, { showDialog: false, showMessage: false });
            await defense.execute();
            return defense;
        };

        it('treats an attack with hits as a hit with all its hits', async () => {
            const defense = await skippedDefense(3);
            assert.strictEqual(defense.hits.value, 0);
            assert.isTrue(defense.failure);
            assert.include(FlowPlan.outcomes(defense), 'hit');
            assert.strictEqual(defense.data.values.againstNetHits.value, 3);
        });

        it('treats an attack without hits as a miss', async () => {
            const defense = await skippedDefense(0);
            assert.isTrue(defense.success);
            assert.include(FlowPlan.outcomes(defense), 'miss');
        });

        it('offers not to defend on every defense, unless the node disallows it', async () => {
            const { attack } = await weaponAttack();
            const step = FlowPlan.step(FlowPlan.resolve(attack), 'opposed')!;
            assert.isTrue(FlowRunner.canSkipDefense(step));

            const { attack: strict } = await weaponAttack({ noDefense: { allowed: false, condition: '' } });
            assert.isFalse(FlowRunner.canSkipDefense(FlowPlan.step(FlowPlan.resolve(strict), 'opposed')!));
        });

        it('resolves a defense the defender can not make right away', async () => {
            FlowConditions.spikeUnaware = () => true;
            try {
                const { attack } = await weaponAttack({ noDefense: { allowed: true, condition: 'spikeUnaware' } }, { showDialog: false, showMessage: true });
                const defender = await factory.createActor({ type: 'character' });
                attack.data.targetUuids = [defender.uuid];
                await attack.execute();

                const entry = flowState(attack.data.messageUuid)?.next.find(entry => entry.stepId === 'opposed');
                assert.strictEqual(entry?.noDefense, 'forced');
                assert.strictEqual(entry?.status, 'done');
            } finally {
                delete FlowConditions.spikeUnaware;
            }
        });
    });

    describe('Applying effects to the target', () => {
        const effectAttack = async (effects: Record<string, unknown>[]) => {
            const { attack, attacker } = await (async () => {
                const attacker = await factory.createActor({ type: 'character' });
                const [weapon] = await attacker.createEmbeddedDocuments('Item', [{
                    name: 'Effect Weapon', type: 'weapon',
                    system: { category: 'melee', action: { test: 'MeleeAttackTest', opposed: { test: 'PhysicalDefenseTest' } }, technology: { equipped: true } },
                }]);
                await weapon.createEmbeddedDocuments('ActiveEffect', effects.map(effect => ({
                    name: 'Effect', ...effect,
                    system: {
                        targets: [{ id: 't', applyTo: 'targeted_actor', ...(effect.target as object ?? {}) }],
                        changes: [{ key: 'system.modifiers.global', value: '-1', type: 'add', target: 't' }],
                        ...(effect.system as object ?? {}),
                    },
                })));
                const attack = await TestCreator.fromItem(weapon, attacker, { showDialog: false, showMessage: false });
                if (!attack) throw new Error('Failed to create attack');
                await attack.populateDocuments();
                return { attack, attacker };
            })();
            const defender = await factory.createActor({ type: 'character' });
            return { attack, attacker, defender };
        };

        const copies = (actor: SR5Actor, name: string) => actor.effects.filter(effect => effect.name === name);

        it('applies only the selected effects', async () => {
            const { attack, defender } = await effectAttack([{ name: 'Chosen' }, { name: 'Other' }]);
            const chosen = attack.item!.effects.find(effect => effect.name === 'Chosen')!;

            await attack.effects.createTargetActorEffects(defender, { select: 'ids', ids: [chosen.id!] });

            assert.lengthOf(copies(defender, 'Chosen'), 1);
            assert.lengthOf(copies(defender, 'Other'), 0);
        });

        it('turns a target into a test effect of the recipient', async () => {
            const { attack, defender } = await effectAttack([{ name: 'Disoriented', target: { appliesAs: 'test_all' } }]);
            await attack.effects.createTargetActorEffects(defender);

            const [copy] = copies(defender, 'Disoriented');
            assert.strictEqual(copy?.system.targets[0].applyTo, 'test_all');
        });

        it('resolves the duration formula once and records where the copy came from', async () => {
            const { attack, attacker, defender } = await effectAttack([{ name: 'Timed', duration: { units: 'minutes', value: 1 }, system: { durationFormula: '@payload.power + 2' } }]);
            await attack.effects.createTargetActorEffects(defender, { ctx: { payload: { power: 4 } }, chainId: 'chain' });

            const [copy] = copies(defender, 'Timed');
            assert.strictEqual(copy?.duration.value, 6);
            const source = attack.item!.effects.find(effect => effect.name === 'Timed')!;
            assert.strictEqual(copy?.system.source.effectUuid, source.uuid);
            assert.strictEqual(copy?.system.source.casterUuid, attacker.uuid);
            assert.strictEqual(copy?.system.source.chainId, 'chain');
        });

        it('stacks, replaces or keeps the stronger copy', async () => {
            const { attack, defender } = await effectAttack([
                { name: 'Stacks', system: { stacking: 'stack' } },
                { name: 'Replaces', system: { stacking: 'replace' } },
            ]);
            await attack.effects.createTargetActorEffects(defender);
            await attack.effects.createTargetActorEffects(defender);

            assert.lengthOf(copies(defender, 'Stacks'), 2);
            assert.lengthOf(copies(defender, 'Replaces'), 1);
        });
    });

    describe('Touch range (SR5#173, SR5#187, SR5#281)', () => {
        const touchSpell = async (testOptions = { showDialog: false, showMessage: false }) => {
            const caster = await factory.createActor({ type: 'character', system: { attributes: { magic: { base: 6 } } } });
            const [spell] = await caster.createEmbeddedDocuments('Item', [{
                name: 'Touch Spell', type: 'spell',
                system: { range: 'touch', category: 'manipulation', drain: 2, action: { test: 'SpellCastingTest', opposed: { test: 'OpposedTest' } } },
            }]);
            const test = await TestCreator.fromItem(spell, caster, testOptions);
            if (!test) throw new Error('Failed to create spell test');
            return { caster, test };
        };

        it('adds a choice to accept or resist before each defense', async () => {
            const { test } = await touchSpell();
            const plan = FlowPlan.resolve(test);

            const choice = FlowPlan.step(plan, 'opposed.before');
            assert.strictEqual(choice?.kind, 'choice');
            assert.strictEqual(choice?.actor, 'target');
            assert.deepEqual(choice?.config.options, ['accept', 'resist']);
            assert.strictEqual(choice?.config.gateFor, 'opposed');
            assert.deepInclude(FlowPlan.step(plan, 'opposed')?.config ?? {}, { gate: { by: 'opposed.before' } });

            const grab = FlowPlan.step(plan, 'opposed.before.option.resist');
            assert.strictEqual(grab?.test, 'MeleeAttackTest');
            assert.strictEqual(grab?.actor, 'self');
            assert.include(grab?.features ?? [], '+touchOnly');
            assert.deepEqual(grab?.when, ['resist']);

            const dodge = FlowPlan.step(plan, 'opposed.before.option.resist.opposed');
            assert.deepEqual(dodge?.releases, ['hit', 'tie']);
            assert.strictEqual(dodge?.actor, 'target');
            // The grab deals no damage, so the dodge applies none.
            assert.isUndefined(FlowPlan.step(plan, 'opposed.before.option.resist.opposed.damage'));
        });

        it('waits with the defense until the target accepts', async () => {
            const { test } = await touchSpell({ showDialog: false, showMessage: true });
            const target = await factory.createActor({ type: 'character' });
            test.data.targetUuids = [target.uuid];
            await test.execute();
            const message = fromUuidSync(test.data.messageUuid!) as ChatMessage;

            const defense = () => flowState(test.data.messageUuid)?.next.find(entry => entry.stepId === 'opposed');
            assert.isTrue(defense()?.gated);

            await FlowGates.choose(message, 'opposed.before', target.uuid, 'accept');

            assert.isFalse(defense()?.gated);
            const choice = flowState(test.data.messageUuid)?.next.find(entry => entry.stepId === 'opposed.before');
            assert.deepEqual(choice?.outcome, ['accept']);
        });

        it('lets the caster try to touch a resisting target, releasing the defense on contact', async () => {
            const { caster, test } = await touchSpell({ showDialog: false, showMessage: true });
            const target = await factory.createActor({ type: 'character' });
            test.data.targetUuids = [target.uuid];
            await test.execute();
            const message = fromUuidSync(test.data.messageUuid!) as ChatMessage;

            await FlowGates.choose(message, 'opposed.before', target.uuid, 'resist');
            const state = flowState(test.data.messageUuid)!;
            const grab = state.next.find(entry => entry.stepId === 'opposed.before.option.resist');
            assert.strictEqual(grab?.status, 'pending');
            assert.strictEqual(grab?.subjectUuid, caster.uuid);
            assert.strictEqual(grab?.branchUuid, target.uuid);
            assert.isTrue(state.next.find(entry => entry.stepId === 'opposed')?.gated);

            // A grazing hit on the targets dodge makes contact.
            const dodgeState = { ...state, stepId: 'opposed.before.option.resist.opposed', branchUuid: target.uuid };
            const tiedDodge = { success: true, failure: false, opposing: true, hits: { value: 2 }, against: { hits: { value: 2 } } } as unknown as SuccessTest;
            await FlowGates.releaseFromTest(tiedDodge, dodgeState);

            assert.isFalse(flowState(test.data.messageUuid)?.next.find(entry => entry.stepId === 'opposed')?.gated);
        });

        it('adds two dice to touch-only attacks', () => {
            const test = TestCreator.fromPool({ pool: 4 }, { showDialog: false, showMessage: false });
            test.data.features = ['+touchOnly'];
            test.prepareBaseValues();
            test.calculateBaseValues();
            assert.strictEqual(test.pool.value, 6);
        });
    });

    describe('Full Defense (SR5#191)', () => {
        it('lasts the Combat Turn, adding Willpower to later defenses without its cost', async () => {
            const defender = await factory.createActor({ type: 'character', system: { attributes: { willpower: { base: 4 } } } });
            const { attack } = await (async () => {
                const attacker = await factory.createActor({ type: 'character' });
                const [weapon] = await attacker.createEmbeddedDocuments('Item', [{
                    name: 'Defense Weapon', type: 'weapon',
                    system: { category: 'melee', action: { test: 'MeleeAttackTest', opposed: { test: 'PhysicalDefenseTest' } }, technology: { equipped: true } },
                }]);
                const attack = await TestCreator.fromItem(weapon, attacker, { showDialog: false, showMessage: false });
                await attack!.execute();
                return { attack: attack! };
            })();

            const combat = await getDocumentClass('Combat').create({ active: true }) as Combat.Implementation;
            try {
                await combat.createEmbeddedDocuments('Combatant', [{ actorId: defender.id }]);
                await combat.startCombat();
                for (const combatant of combat.combatants) await combatant.update({ initiative: 20 });

                const defend = async (activeDefense: string) => {
                    const data = await PhysicalDefenseTest._getOpposedActionTestData(attack.data, defender, '');
                    const defense = new PhysicalDefenseTest(data!, { actor: defender, source: defender }, { showDialog: false, showMessage: false });
                    await defense._prepareExecution();
                    defense.data.activeDefense = activeDefense;
                    await defense.execute();
                    return defense;
                };

                await defend('full_defense');
                const effect = defender.effects.find(effect => !!foundry.utils.getProperty(effect.flags, `${SYSTEM_NAME}.${FLAGS.FullDefense}`));
                assert.exists(effect, 'Going on Full Defense leaves an effect for the Combat Turn');

                const second = await defend('');
                assert.strictEqual(second.pool.changes.find(change => change.name === 'SR5.FullDefense')?.value, 4);
                assert.notProperty(second.data.activeDefenses, 'full_defense');
                assert.lengthOf(defender.effects.filter(effect => !!foundry.utils.getProperty(effect.flags, `${SYSTEM_NAME}.${FLAGS.FullDefense}`)), 1);
            } finally {
                await combat.delete();
            }
        });
    });

    describe('Branch contributors', () => {
        it('lets a defender with Energy Aura damage a hitting melee attacker (SR5#396)', async () => {
            const attacker = await factory.createActor({ type: 'character' });
            const [weapon] = await attacker.createEmbeddedDocuments('Item', [{
                name: 'Aura Weapon', type: 'weapon',
                system: { category: 'melee', action: { test: 'MeleeAttackTest', opposed: { test: 'PhysicalDefenseTest' } }, technology: { equipped: true } },
            }]);
            const attack = await TestCreator.fromItem(weapon, attacker, { showDialog: false, showMessage: true });
            if (!attack) return assert.fail('No attack');
            await attack.execute();

            const critter = await factory.createActor({ type: 'spirit', system: { attributes: { magic: { base: 3 } } } });
            await critter.createEmbeddedDocuments('Item', [{ name: 'Energy Aura', type: 'critter_power' }]);
            const rootMessage = fromUuidSync(attack.data.messageUuid!) as ChatMessage;
            const data = await PhysicalDefenseTest._getOpposedActionTestData(attack.data, critter, rootMessage.id!);
            const defense = new PhysicalDefenseTest(data!, { actor: critter, source: critter }, { showDialog: false, showMessage: true });
            Object.defineProperty(defense, 'success', { get: () => false });
            Object.defineProperty(defense, 'failure', { get: () => true });
            await defense.execute();

            const state = flowState(defense.data.messageUuid)!;
            const aura = FlowPlan.step(state.plan, 'opposed.followed@energyAura');
            assert.strictEqual(aura?.test, 'PhysicalResistTest');
            assert.strictEqual(aura?.actor, 'self');
            assert.strictEqual(aura?.source?.name, 'Energy Aura');
            // A spirits Magic follows its Force.
            assert.strictEqual(FlowContext.stepDamage(aura!, defense)?.value, Number(critter.getAttribute('magic')?.value) * 2);

            const entry = state.next.find(entry => entry.stepId === 'opposed.followed@energyAura');
            assert.strictEqual(entry?.status, 'pending');
            assert.strictEqual(entry?.subjectUuid, attacker.uuid);
            // Only this defenders branch has the retaliation.
            assert.isUndefined(FlowPlan.step(flowState(attack.data.messageUuid)!.plan, 'opposed.followed@energyAura'));
        });
    });

    describe('Damage elements and formulas', () => {
        it('counts every element of a damage in full (#1214)', () => {
            const damage = { element: { base: 'fire', value: 'fire' }, elements: ['water'] };
            assert.sameMembers(DamageRules.elements(damage as never), ['fire', 'water']);
            assert.isTrue(DamageRules.hasElement(damage as never, 'water'));
            assert.isFalse(DamageRules.hasElement(damage as never, 'acid'));
        });

        it('takes the base damage from a formula reading the item (#1216)', async () => {
            const { test } = await equipmentTest({ damage: { base: 1, value: 1, formula: '@item.rating * 2', type: { base: 'physical', value: 'physical' } } });
            await test.execute();
            assert.strictEqual(test.data.damage.base, 6);
        });
    });

    describe('Damage', () => {
        const parent = (value: number) => ({ data: { modifiedDamage: { value, base: value, changes: [], type: { base: 'physical', value: 'physical' }, ap: { value: 0 } } } }) as unknown as SuccessTest;

        it('scales the damage a step works with, as a rigger resisting half the vehicles damage (SR5#266)', () => {
            const step = createFlowStep({ id: 'biofeedback', damage: { mode: 'taken', factor: 0.5, round: 'up', unresisted: false } });
            assert.strictEqual(FlowContext.stepDamage(step, parent(5))?.value, 3);
            assert.strictEqual(FlowContext.stepDamage({ ...step, damage: { ...step.damage, round: 'down' } }, parent(5))?.value, 2);
        });

        it('takes no damage from the parent for steps dealing their own', () => {
            const step = createFlowStep({
                id: 'aura',
                damage: { mode: 'own', factor: 1, round: 'up', unresisted: true },
                settings: { damage: { base: 4, value: 4, changes: [], formula: '', type: { base: 'stun', value: 'stun' }, ap: { base: 0, value: 0, changes: [] } } },
            });
            assert.strictEqual(FlowContext.stepDamage(step, parent(9))?.value, 4);
        });

        it('applies the net hits of a successful defense back to the attacker, unresisted (SR5#231)', async () => {
            const { actor: attacker, test } = await equipmentTest({
                opposed: {
                    test: 'PhysicalDefenseTest',
                    followed: {
                        kind: 'applyDamage', actor: 'other', when: ['miss'], unresisted: true,
                        damage: { base: 0, value: 0, formula: '@parent.netHits', type: { base: 'stun', value: 'stun' } },
                    },
                },
            });
            await test.execute();
            const plan = FlowPlan.resolve(test);
            const backlash = FlowPlan.step(plan, 'opposed.followed');
            assert.strictEqual(backlash?.kind, 'applyDamage');
            assert.strictEqual(backlash?.actor, 'self');
            assert.deepEqual(backlash?.when, ['miss']);

            const defender = await factory.createActor({ type: 'character' });
            const data = await PhysicalDefenseTest._getOpposedActionTestData(test.data, defender, '');
            if (!data) return assert.fail('No defense test data');
            const defense = new PhysicalDefenseTest(data, { actor: defender, source: defender }, { showDialog: false, showMessage: false });
            Object.defineProperty(defense, 'netHits', { get: () => ({ value: 2 }) });

            const applied = await FlowRunner.applyStep(defense, backlash!, { stepId: backlash!.id, subjectUuid: attacker.uuid, status: 'pending' });

            assert.isTrue(applied);
            assert.strictEqual(takenDamage(attacker), 2);
        });
    });

    describe('Toxins and drugs (SR5#408-415)', () => {
        const toxin = { kind: 'toxin', vectors: ['injection'], power: 6, penetration: 0, damageType: 'stun', effects: [] };

        it('lowers the Power of a toxin by the hits resisting it', async () => {
            const actor = await factory.createActor({ type: 'character' });
            const test = new ToxinResistTest({ payload: toxin } as never, { actor, source: actor }, { showDialog: false, showMessage: false });
            await test.execute();
            test.data.values.hits.value = 2;
            await test.processResults();

            assert.strictEqual(test.remainingPower, 4);
            assert.strictEqual(test.data.modifiedDamage.value, 4);
            assert.strictEqual(test.data.modifiedDamage.type.value, 'stun');
            assert.isTrue(test.failure);

            test.data.values.hits.value = 6;
            await test.processResults();
            assert.isTrue(test.success, 'Fully resisted, a toxin takes no effect');
            assert.strictEqual(test.data.modifiedDamage.value, 0);
        });

        it('delivers a toxin loaded as ammo when the dart penetrates (SR5#434)', async () => {
            const actor = await factory.createActor({ type: 'character' });
            const [weapon] = await actor.createEmbeddedDocuments('Item', [{
                type: 'weapon', name: 'Dart Pistol', system: { category: 'range', technology: { equipped: true } },
            }]);
            const ammo = await factory.createItem({ type: 'ammo', system: { technology: { equipped: true }, payload: toxin } } as never);
            await (weapon as SR5Item<'weapon'>).createNestedItem(ammo.toObject());

            const attack = await TestCreator.fromItem(weapon, actor, { showDialog: false, showMessage: false });
            if (!attack) return assert.fail('No attack');
            const step = FlowPlan.step(FlowPlan.resolve(attack), 'opposed.followed');

            assert.strictEqual(step?.test, 'ToxinResistTest');
            assert.strictEqual(step?.actor, 'target');
            assert.deepEqual(step?.when, ['hit']);
            assert.strictEqual(step?.condition, 'dartPenetrates');
            assert.strictEqual((step?.config.payload as { power: number }).power, 6);
        });

        it('needs a net hit against an unarmored target and three against an armored one (SR5#434)', async () => {
            const unarmored = await factory.createActor({ type: 'character' });
            const armored = await factory.createActor({ type: 'character' });
            await armored.createEmbeddedDocuments('Item', [{ name: 'Vest', type: 'armor', system: { armor: { base: 9, value: 9 }, technology: { equipped: true } } }]);
            const defense = (netHits: number) => ({ data: { values: { againstNetHits: { value: netHits } } } }) as unknown as SuccessTest;
            const penetrates = (actor: SR5Actor, netHits: number) => FlowConditions.dartPenetrates({ step: createFlowStep({ id: 'toxin' }), test: defense(netHits), actor });

            assert.isFalse(penetrates(unarmored, 0));
            assert.isTrue(penetrates(unarmored, 1));
            assert.isFalse(penetrates(armored, 2));
            assert.isTrue(penetrates(armored, 3));
        });

        const drug = async (quantity: number) => {
            const actor = await factory.createActor({ type: 'character' });
            const [item] = await actor.createEmbeddedDocuments('Item', [{
                name: 'Jazz', type: 'chemical',
                system: {
                    technology: { quantity },
                    kind: 'drug', vectors: ['inhalation'], duration: { formula: '2', unit: 'hours' }, addiction: { type: 'both', rating: 8, threshold: 3 },
                },
            }]);
            // What the drug does to whoever takes it, authored like any effect on its actor.
            await item.createEmbeddedDocuments('ActiveEffect', [{
                name: 'Jazz High',
                system: {
                    targets: [{ id: 't', applyTo: 'actor' }],
                    changes: [{ key: 'system.attributes.reaction', value: '1', type: 'add', phase: 'initial', target: 't' }],
                },
            }]);
            return { actor, item };
        };

        const highs = (actor: SR5Actor) => actor.effects.filter(effect => effect.name === 'Jazz High');

        it('does nothing to the actor carrying it', async () => {
            const { actor, item } = await drug(2);
            const carried = actor.getAttribute('reaction')?.value;
            await item.delete();
            assert.strictEqual(actor.getAttribute('reaction')?.value, carried, 'Carrying the drug changes no attribute');
            assert.lengthOf(highs(actor), 0);
        });

        it('uses up a dose and applies the drugs effects to its user, without a roll (SR5#410)', async () => {
            const { actor, item } = await drug(2);
            const message = await FlowRunner.startChain(item, actor);

            assert.exists(message);
            assert.strictEqual(Number((item.system as { technology: { quantity: number } }).technology.quantity), 1);
            const [high] = highs(actor);
            assert.exists(high, 'The drugs effect lands on its user');
            assert.strictEqual(high.duration.value, 2);
            assert.strictEqual(high.duration.units, 'hours');
            assert.deepEqual(foundry.utils.getProperty(high.flags, `${SYSTEM_NAME}.${FLAGS.Chemical}`), { itemUuid: item.uuid, addictionRating: 8 });
        });

        it('can not be used without doses left', async () => {
            const { actor, item } = await drug(0);
            assert.isUndefined(await FlowRunner.startChain(item, actor));
            assert.lengthOf(highs(actor), 0);
        });

        it('overdoses when taken while already on it (SR5#415)', async () => {
            const { actor, item } = await drug(2);
            const chemical = item.system as unknown as never;
            assert.strictEqual(FlowChemicals.overdosePower(actor, item, chemical), 0);

            await FlowRunner.startChain(item, actor);
            assert.strictEqual(FlowChemicals.overdosePower(actor, item, chemical), 16, 'The sum of both Addiction Ratings');

            const root = await TestCreator.fromItem(item, actor, { showDialog: false, showMessage: false });
            root!.data.rollless = true;
            const overdose = FlowPlan.step(FlowPlan.resolve(root!), 'followed.resist');
            assert.strictEqual(overdose?.test, 'ToxinResistTest');
            assert.strictEqual((overdose?.config.payload as { power: number }).power, 16);
        });
    });

    describe('Groups of actors', () => {
        const state = (overrides: Partial<FlowState> = {}) => ({
            stepId: 'root', rootActorUuid: 'Actor.leader', subjectUuid: 'Actor.leader', branchUuid: '', targets: ['Actor.target'],
            participants: ['Actor.one', 'Actor.two'], plan: [], next: [], ...overrides,
        }) as unknown as FlowState;

        it('runs a step for the leader and each participant, each in a branch of their own (SR5#296)', () => {
            const drain = createFlowStep({ id: 'followed', actor: 'participants' });
            const damage = createFlowStep({ id: 'followed.damage', actor: 'participants' });

            assert.deepEqual(FlowRunner.stepSubjects(drain, state()), ['Actor.leader', 'Actor.one', 'Actor.two']);
            assert.isTrue(FlowRunner.startsGroup(drain, state()));
            // Below, each participant stays in their branch.
            const branch = state({ stepId: 'followed', plan: [drain, damage], branchUuid: 'Actor.one', subjectUuid: 'Actor.one' });
            assert.deepEqual(FlowRunner.stepSubjects(damage, branch), ['Actor.one']);
            assert.deepEqual(FlowRunner.stepSubjects(createFlowStep({ id: 'x', actor: 'allies' }), state()), ['Actor.one', 'Actor.two']);
        });

        it('has everyone taking part in a ritual take its drain', async () => {
            const actor = await factory.createActor({ type: 'character', system: { attributes: { magic: { base: 6 } } } });
            const [ritual] = await actor.createEmbeddedDocuments('Item', [{ name: 'Ward', type: 'ritual' }]);
            const test = await TestCreator.fromItem(ritual, actor, { showDialog: false, showMessage: false });
            if (!test) return assert.fail('No ritual test');

            assert.strictEqual(FlowPlan.step(FlowPlan.resolve(test), 'followed')?.actor, 'participants');
        });

        it('lets assistants roll first and records them on the leaders test (SR5#49)', async () => {
            const leader = await factory.createActor({ type: 'character' });
            const assistant = await factory.createActor({ type: 'character' });
            const [item] = await leader.createEmbeddedDocuments('Item', [{
                name: 'Team Action', type: 'action',
                system: { action: { type: 'simple', test: 'SuccessTest', skill: 'perception', attribute: 'intuition', assist: { test: 'SuccessTest' } } },
            }]);

            const message = await item.castAction(undefined, leader) as ChatMessage | undefined;
            const teamwork = message?.getFlag(SYSTEM_NAME, FLAGS.Test) as { skill: string, itemUuid: string } | undefined;
            assert.strictEqual(teamwork?.itemUuid, item.uuid);
            assert.strictEqual(teamwork?.skill, 'perception');

            const test = await leader.teamworkItemTest({
                skill: 'perception', additionalDice: 2, additionalLimit: 1, criticalGlitch: false,
                participantUuids: [assistant.uuid!], itemUuid: item.uuid!,
            }, { showDialog: false, showMessage: false });
            assert.deepEqual(test?.data.participantUuids, [assistant.uuid]);
            assert.strictEqual(test?.data.pool.changes.find(change => change.name === 'Teamwork')?.value, 2);
        });

        it('runs a step for a vehicle and everyone inside it (SR5#201)', async () => {
            const driver = await factory.createActor({ type: 'character' });
            const vehicle = await factory.createActor({ type: 'vehicle', system: { driver: driver.uuid } });
            const crash = createFlowStep({ id: 'followed', actor: 'occupants' });

            assert.deepEqual(FlowRunner.stepSubjects(crash, state({ rootActorUuid: vehicle.uuid! })), [vehicle.uuid, driver.uuid]);
        });

        it('runs a step for whoever controls an actor, like a spirits summoner', async () => {
            const summoner = await factory.createActor({ type: 'character' });
            const spirit = await factory.createActor({ type: 'spirit', system: { summonerUuid: summoner.uuid } });
            const step = createFlowStep({ id: 'followed', actor: 'owner' });

            assert.deepEqual(FlowRunner.stepSubjects(step, state({ rootActorUuid: spirit.uuid! })), [summoner.uuid]);
        });

        it('lets someone else defend against an attack that missed (SR5#190)', async () => {
            const { test } = await equipmentTest({
                test: 'RangedAttackTest',
                opposed: { test: 'PhysicalDefenseTest', opposed: { test: 'PhysicalDefenseTest', actor: 'pick', when: ['miss'] } },
            });
            const plan = FlowPlan.resolve(test);
            const retarget = FlowPlan.step(plan, 'opposed.opposed');

            assert.strictEqual(retarget?.actor, 'pick');
            assert.deepEqual(retarget?.when, ['miss']);
            assert.strictEqual(retarget?.config.against, 'primary');
            const defense = state({ stepId: 'opposed', plan, branchUuid: 'Actor.target', subjectUuid: 'Actor.target' });
            assert.deepEqual(FlowRunner.stepSubjects(retarget!, defense), ['']);
        });
    });
};
