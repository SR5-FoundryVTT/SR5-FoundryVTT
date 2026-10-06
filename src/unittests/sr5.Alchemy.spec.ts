import { QuenchBatchContext } from "@ethaks/fvtt-quench";
import { AlchemyRules } from "../module/rules/AlchemyRules";
import { PreparationDecayFlow } from "../module/flows/PreparationDecayFlow";
import { WorldTimeFlow } from "../module/flows/WorldTimeFlow";
import { SR5TestFactory } from "./utils";
import { TestCreator } from "../module/tests/TestCreator";
import { PreparationCreationTest } from "../module/tests/PreparationCreationTest";
import { PreparationTriggerTest } from "../module/tests/PreparationTriggerTest";
import { OpposedPreparationForceTest } from "../module/tests/OpposedPreparationForceTest";
import { PhysicalDefenseTest } from "../module/tests/PhysicalDefenseTest";
import { SR5Actor } from "../module/actor/SR5Actor";
import { SR5Item } from "../module/item/SR5Item";
import { PreparationTimeDialog } from "../module/apps/dialogs/PreparationTimeDialog";
import { preparePreparationPotencyStatus } from "../module/item/prep/PreparationPotencyStatus";
import { TestDialog } from "../module/apps/dialogs/TestDialog";
import { intervalToSeconds } from "../module/utils/timeUnits";

const HOUR = 3600;

/**
 * Alchemical preparation rules as described on SR5#304-306 and SG#209-210.
 */
export const shadowrunAlchemy = (context: QuenchBatchContext) => {
    const factory = new SR5TestFactory();
    const { describe, it, after } = context;
    const assert: Chai.AssertStatic = context.assert;

    after(async () => { await factory.destroy(); });

    /**
     * A Force 4, Potency 3 indirect combat preparation created just now. Tests only override what
     * they're about. Without a parent it's created as a world item.
     */
    const createPreparation = async (system: Record<string, unknown> = {}, parent?: SR5Actor) => {
        const data = {
            name: 'Prepared Fireball', type: 'preparation' as const,
            system: foundry.utils.mergeObject({
                category: 'combat', type: 'physical', combat: { type: 'indirect' }, range: 'los',
                force: 4, trigger: 'command', potency: { base: 3 },
                created: { worldTime: game.time.worldTime },
            }, system, { inplace: false }),
        };
        if (!parent) return await factory.createItem(data as any) as SR5Item<'preparation'>;

        const [item] = await parent.createEmbeddedDocuments('Item', [data as any]) as SR5Item[];
        return item as SR5Item<'preparation'>;
    };

    describe('Creating a preparation', () => {
        it('limits force to twice the magic rating', () => {
            assert.equal(AlchemyRules.maxForce(5), 10);
            assert.isTrue(AlchemyRules.validForce(10, 5));
            assert.isFalse(AlchemyRules.validForce(11, 5));
            // A force of zero is no preparation at all.
            assert.isFalse(AlchemyRules.validForce(0, 5));
        });

        it('adds the trigger drain modifier', () => {
            assert.equal(AlchemyRules.triggerDrainModifier('command'), 2);
            assert.equal(AlchemyRules.triggerDrainModifier('contact'), 1);
            assert.equal(AlchemyRules.triggerDrainModifier('time'), 2);
            // An unset trigger shouldn't invent drain.
            assert.equal(AlchemyRules.triggerDrainModifier(''), 0);
        });

        it('derives drain from force, the spell and the trigger', () => {
            // Force 5, spell drain -2, command trigger +2 => 5. SR5#305 example.
            assert.equal(AlchemyRules.drainValue(5, -2, 'command'), 5);
            assert.equal(AlchemyRules.drainValue(5, -2, 'contact'), 4);
        });

        it('never drops drain below the minimum of two', () => {
            assert.equal(AlchemyRules.drainValue(1, -6, 'contact'), 2);
        });

        it('needs force minutes of uninterrupted crafting', () => {
            assert.equal(AlchemyRules.craftingMinutes(5), 5);
        });

        it('bounds a time trigger by the resulting potency in hours', () => {
            assert.isTrue(AlchemyRules.validTriggerTime(6 * HOUR, 6));
            assert.isFalse(AlchemyRules.validTriggerTime(7 * HOUR, 6));
            assert.isFalse(AlchemyRules.validTriggerTime(-1, 6));
            assert.equal(AlchemyRules.effectiveTriggerTime(7 * HOUR, 6), 6 * HOUR);
            assert.equal(AlchemyRules.effectiveTriggerTime(-1, 6), 0);
        });

        it('keeps the trigger time amount and unit through dialog edits', () => {
            const creation = new PreparationCreationTest({ trigger: 'time' });
            const dialog = new TestDialog(creation);

            for (const [unit, seconds] of [['seconds', 5], ['minutes', 300], ['hours', 18000]] as const) {
                dialog._updateData({
                    'test.data.triggerTime.value': 5,
                    'test.data.triggerTime.unit': unit,
                });
                assert.equal(intervalToSeconds(creation.data.triggerTime), seconds);
                assert.deepEqual(creation.data.triggerTime, { value: 5, unit });

                // Unrelated edits leave the amount and unit alone.
                dialog._updateData({ 'test.data.reagents': 3 });
                assert.equal(intervalToSeconds(creation.data.triggerTime), seconds);
                assert.deepEqual(creation.data.triggerTime, { value: 5, unit });
            }

            dialog._updateData({
                'test.data.triggerTime.value': 0.5,
                'test.data.triggerTime.unit': 'hours',
            });
            assert.equal(intervalToSeconds(creation.data.triggerTime), 1800);
            assert.isTrue(AlchemyRules.validTriggerTime(intervalToSeconds(creation.data.triggerTime), 1));

            dialog._updateData({ 'test.data.triggerTime.value': 0 });
            assert.equal(intervalToSeconds(creation.data.triggerTime), 0);
        });
    });

    describe('Potency decay', () => {
        it('holds full potency for twice the potency in hours', () => {
            assert.equal(AlchemyRules.currentPotency(5, 0, 0), 5);
            assert.equal(AlchemyRules.currentPotency(5, 0, 9 * HOUR), 5);
            // The full strength window ends at hour 10, and is inclusive.
            assert.equal(AlchemyRules.currentPotency(5, 0, 10 * HOUR), 5);
        });

        it('loses one potency per hour after that', () => {
            assert.equal(AlchemyRules.currentPotency(5, 0, 11 * HOUR), 4);
            assert.equal(AlchemyRules.currentPotency(5, 0, 13 * HOUR), 2);
        });

        it('reaches zero after three times the potency in hours', () => {
            assert.equal(AlchemyRules.currentPotency(5, 0, 15 * HOUR), 0);
            assert.equal(AlchemyRules.expiresAt(5, 0), 15 * HOUR);
        });

        it('never goes below zero', () => {
            assert.equal(AlchemyRules.currentPotency(5, 0, 100 * HOUR), 0);
        });

        it('is unaffected by world time moving backwards', () => {
            assert.equal(AlchemyRules.currentPotency(5, 10 * HOUR, 0), 5);
        });

        it('counts from the creation time, not from zero', () => {
            const created = 1000 * HOUR;
            assert.equal(AlchemyRules.currentPotency(5, created, created + 10 * HOUR), 5);
            assert.equal(AlchemyRules.currentPotency(5, created, created + 11 * HOUR), 4);
        });

        it('treats a failed creation as no preparation at all', () => {
            assert.equal(AlchemyRules.currentPotency(0, 0, 0), 0);
            assert.equal(AlchemyRules.expiresAt(0, 0), 0);
        });
    });

    describe('Triggering a preparation', () => {
        it('rolls force plus potency', () => {
            // SG#210: the preparation rolls Force + Potency [Force]
            assert.deepEqual(AlchemyRules.activationPool(5, 6), { force: 5, potency: 6 });
        });

        it('never rolls negative pool parts', () => {
            assert.deepEqual(AlchemyRules.activationPool(-1, -2), { force: 0, potency: 0 });
        });

        it('releases a timed preparation its trigger time after creation', () => {
            assert.equal(AlchemyRules.triggerAt(10 * HOUR, 2 * HOUR), 12 * HOUR);
            assert.equal(AlchemyRules.triggerAt(10 * HOUR, -1), 10 * HOUR);
        });

        it('cannot be dodged when an indirect spell is released by contact', () => {
            // SG#210
            assert.isFalse(AlchemyRules.canBeDodged('contact', 'indirect'));
            assert.isTrue(AlchemyRules.canBeDodged('contact', 'direct'));
            assert.isTrue(AlchemyRules.canBeDodged('command', 'indirect'));
        });
    });

    describe('The SR5#305 worked example', () => {
        // Abbi Kadabra, Magic 5 and Alchemy 5, prepares a Force 5 Shadow spell (Drain F-2)
        // with a command trigger, spending 8 drams of reagents for 6 net hits.
        const force = 5;
        const magic = 5;
        const spellDrain = -2;
        const netHits = 6;

        it('allows the chosen force', () => {
            assert.isTrue(AlchemyRules.validForce(force, magic));
        });

        it('takes five minutes to craft', () => {
            assert.equal(AlchemyRules.craftingMinutes(force), 5);
        });

        it('resists a drain value of five', () => {
            assert.equal(AlchemyRules.drainValue(force, spellDrain, 'command'), 5);
        });

        it('takes physical drain because the hits beat the magic rating', () => {
            assert.isAbove(netHits, magic);
        });

        it('keeps full potency of six for twelve hours and dies at eighteen', () => {
            assert.equal(AlchemyRules.currentPotency(netHits, 0, 12 * HOUR), 6);
            assert.equal(AlchemyRules.currentPotency(netHits, 0, 13 * HOUR), 5);
            assert.equal(AlchemyRules.expiresAt(netHits, 0), 18 * HOUR);
        });

        it('rolls eleven dice when triggered', () => {
            const pool = AlchemyRules.activationPool(force, netHits);
            assert.equal(pool.force + pool.potency, 11);
        });
    });

    describe('The alchemy flow', () => {
        /**
         * An alchemist with the skill and the magic rating to prepare something.
         */
        const createAlchemist = async () => {
            const alchemist = await factory.createActor({
                type: 'character',
                system: { attributes: { magic: { base: 5 } } }
            });
            await alchemist.createEmbeddedDocuments('Item', [{
                name: 'Alchemy', type: 'skill',
                system: { type: 'skill', skill: { category: 'active', rating: 5, attribute: 'magic' } }
            }]);
            return alchemist;
        };

        const createAlchemicalSpell = async (alchemist: SR5Actor) => {
            const [spell] = await alchemist.createEmbeddedDocuments('Item', [{
                name: 'Fireball', type: 'spell',
                system: {
                    alchemical: true, category: 'combat', type: 'physical',
                    range: 'los_a', duration: 'instant', drain: -1,
                    combat: { type: 'indirect' },
                    action: {
                        damage: { base: 6, type: { base: 'physical', value: 'physical' } },
                        opposed: { attribute: 'reaction', attribute2: 'intuition' }
                    }
                }
            }]) as SR5Item[];
            return spell as SR5Item<'spell'>;
        };

        it('is a preparation formula rather than a castable spell', async () => {
            // An alchemical spell is learned separately from its sorcery counterpart, so the two
            // are separate items rolling separate chains. SR5#304.
            const alchemist = await createAlchemist();
            const alchemical = await createAlchemicalSpell(alchemist);

            assert.equal(alchemical.system.action.test, 'PreparationCreationTest');
            assert.equal(alchemical.system.action.opposed.test, 'OpposedPreparationForceTest');
            assert.equal(alchemical.system.action.opposed.resist.test, '');
            assert.equal(alchemical.system.action.followed.test, 'DrainTest');
            assert.equal(alchemical.system.action.skill, 'alchemy');

            const [created] = await alchemist.createEmbeddedDocuments('Item', [{
                name: 'Manabolt', type: 'spell',
                system: { category: 'combat', combat: { type: 'indirect' } }
            }]) as SR5Item[];
            const mundane = created as SR5Item<'spell'>;

            assert.equal(mundane.system.action.test, 'SpellCastingTest');
            // Indirect combat spells are dodged like ranged attacks.
            assert.equal(mundane.system.action.opposed.test, 'PhysicalDefenseTest');
        });

        it('switches the rolled skill when the flag is toggled on an existing spell', async () => {
            const alchemist = await createAlchemist();
            // As the Chummer importer leaves it: a sorcery spell already naming its own skill.
            const [created] = await alchemist.createEmbeddedDocuments('Item', [{
                name: 'Fireball', type: 'spell',
                system: {
                    category: 'combat', combat: { type: 'indirect' },
                    action: { skill: 'spellcasting', attribute: 'magic' }
                }
            }]) as SR5Item[];
            const spell = created as SR5Item<'spell'>;
            assert.equal(spell.system.action.skill, 'spellcasting');

            await spell.update({ system: { alchemical: true } });

            // Without rewriting the skill the merge would keep 'spellcasting', since a non-default
            // item skill wins over a test class default.
            assert.equal(spell.system.action.skill, 'alchemy');
            assert.equal(spell.system.action.test, 'PreparationCreationTest');

            await spell.update({ system: { alchemical: false } });
            assert.equal(spell.system.action.skill, 'spellcasting');
            assert.equal(spell.system.action.test, 'SpellCastingTest');
        });

        it('rolls alchemy rather than spellcasting', async () => {
            const alchemist = await createAlchemist();
            const spell = await createAlchemicalSpell(alchemist);

            const test = await TestCreator.fromItem(
                spell, alchemist, { showDialog: false, showMessage: false });

            assert.isOk(test);
            assert.instanceOf(test, PreparationCreationTest);
            assert.equal(test?.data.action.skill, 'alchemy');
            assert.equal(test?.data.action.attribute, 'magic');
            assert.equal(test?.data.opposed.test, 'OpposedPreparationForceTest');
        });

        it('replaces the force limit when reagents are selected after initial preparation', async () => {
            const alchemist = await createAlchemist();
            const spell = await createAlchemicalSpell(alchemist);
            const creation = await TestCreator.fromItem(
                spell, alchemist, { showDialog: false, showMessage: false }) as PreparationCreationTest;

            creation.data.force = 5;
            creation.data.reagents = 0;
            creation.prepareLimitValue();
            creation.calculateBaseValues();
            assert.equal(creation.limit.value, 5);

            creation.data.reagents = 8;
            creation.prepareLimitValue();
            creation.calculateBaseValues();
            assert.equal(creation.limit.value, 8);
            assert.isFalse(creation.limit.changes.some(change => change.name === 'SR5.Force'));

            creation.data.reagents = 0;
            creation.prepareLimitValue();
            creation.calculateBaseValues();
            assert.equal(creation.limit.value, 5);
            assert.isFalse(creation.limit.changes.some(change => change.name === 'SR5.Reagent'));
        });

        it('creates a preparation carrying the spell, force and potency', async () => {
            const alchemist = await createAlchemist();
            const spell = await createAlchemicalSpell(alchemist);

            const creation = await TestCreator.fromItem(
                spell, alchemist, { showDialog: false, showMessage: false }) as PreparationCreationTest;

            creation.data.trigger = 'contact';
            await creation.execute();

            // Without a dialog the force settles on the minimal viable one for the spell's drain.
            assert.equal(creation.data.force, 3);

            const opposed = new OpposedPreparationForceTest(
                { against: creation.data }, { source: alchemist }, { showDialog: false, showMessage: false });
            opposed.against.actor = alchemist;
            opposed.against.item = spell;

            // Give the alchemist three net hits over the force.
            opposed.against.data.values.hits.value = 3;
            opposed.data.values.hits.value = 0;
            await opposed.processFailure();

            const preparation = await fromUuid<SR5Item>(opposed.data.preparationUuid) as SR5Item<'preparation'>;
            assert.isOk(preparation);

            assert.equal(preparation.system.force, creation.data.force);
            assert.equal(preparation.system.trigger, 'contact');
            assert.equal(preparation.system.potency.base, 3);
            assert.equal(preparation.system.spellUuid, spell.uuid);
            // The stored spell travels with it, so the defense chain still resolves.
            assert.equal(preparation.system.category, 'combat');
            assert.equal(preparation.system.combat.type, 'indirect');
            assert.equal(preparation.system.drain, -1);
            assert.equal(preparation.system.action.damage.base, 6);
            assert.equal(preparation.system.action.damage.type.base, 'physical');
            // Copied casting selectors must not override the defense test's own attributes.
            assert.equal(preparation.system.action.opposed.test, 'PhysicalDefenseTest');
            assert.equal(preparation.system.action.opposed.attribute, '');
            assert.equal(preparation.system.action.opposed.attribute2, '');
            assert.isFalse(AlchemyRules.canBeDodged(preparation.system.trigger, preparation.system.combat.type));
        });

        it('preserves the chosen timer unit while limiting creation to potency hours', async () => {
            const alchemist = await createAlchemist();
            const spell = await createAlchemicalSpell(alchemist);
            const creation = await TestCreator.fromItem(
                spell, alchemist, { showDialog: false, showMessage: false }) as PreparationCreationTest;
            creation.data.trigger = 'time';
            creation.data.triggerTime = { value: 5, unit: 'hours' };
            creation.data.potency = 3;

            const opposed = new OpposedPreparationForceTest(
                { against: creation.data }, { source: alchemist }, { showDialog: false, showMessage: false });
            opposed.against.actor = alchemist;
            opposed.against.item = spell;
            await opposed.createPreparationItem();
            const preparation = await fromUuid<SR5Item>(opposed.data.preparationUuid) as SR5Item<'preparation'>;
            assert.deepEqual(preparation.system.triggerTime, { value: 3, unit: 'hours' });
            assert.isFalse(PreparationDecayFlow.isTimeTriggerDue(preparation.system, preparation.system.created.worldTime + 3 * HOUR - 1));
            assert.isTrue(PreparationDecayFlow.isTimeTriggerDue(preparation.system, preparation.system.created.worldTime + 3 * HOUR));
        });

        it('creates nothing when the force wins, but still owes drain', async () => {
            const alchemist = await createAlchemist();
            const spell = await createAlchemicalSpell(alchemist);

            const creation = await TestCreator.fromItem(
                spell, alchemist, { showDialog: false, showMessage: false }) as PreparationCreationTest;
            await creation.execute();

            const opposed = new OpposedPreparationForceTest(
                { against: creation.data }, { source: alchemist }, { showDialog: false, showMessage: false });
            opposed.against.actor = alchemist;
            opposed.against.item = spell;

            const itemsBefore = alchemist.items.size;
            await opposed.processSuccess();

            assert.equal(alchemist.items.size, itemsBefore);
            assert.equal(opposed.data.preparationUuid, '');
            // Drain is owed even when the preparation fails. SR5#305.
            assert.isTrue(opposed.against.data.drainReady);
            assert.isAbove(opposed.against.data.drain, 0);
        });

        it('opposes with the force alone', async () => {
            const alchemist = await createAlchemist();
            // An area spell with defense selectors, as imported from Chummer.
            const spell = await createAlchemicalSpell(alchemist);

            const creation = await TestCreator.fromItem(
                spell, alchemist, { showDialog: false, showMessage: false }) as PreparationCreationTest;
            await creation.execute();

            const data = await OpposedPreparationForceTest._getOpposedActionTestData(creation.data, alchemist, '');
            assert.isOk(data);
            const opposed = new OpposedPreparationForceTest(
                data!, { source: alchemist }, { showDialog: false, showMessage: false });
            await opposed.execute();

            // Neither the target's defense attributes nor the area dodge penalty apply.
            assert.equal(opposed.pool.value, creation.data.force);
            assert.deepEqual(opposed.pool.changes.map(change => change.name), ['SR5.Force']);
        });

        it('triggers on force plus potency and consumes the preparation', async () => {
            const alchemist = await createAlchemist();
            const preparation = await createPreparation({ trigger: 'contact', drain: -1 }, alchemist);

            const trigger = await TestCreator.fromItem(
                preparation, alchemist, { showDialog: false, showMessage: false }) as PreparationTriggerTest;

            assert.isOk(trigger);
            await trigger.execute();

            // Force 4 + Potency 3, with the triggering actor's own skills contributing nothing.
            assert.equal(trigger.pool.value, 7);
            assert.equal(trigger.limit.value, 4);
            // No drain, the alchemist paid it at creation. SR5#306.
            assert.equal(trigger.data.drain, 0);
            assert.equal(trigger.data.action.followed.test, '');

            // Single use. SG#209.
            assert.equal(preparation.system.potency.base, 0);
            assert.equal(preparation.system.potency.value, 0);
        });

        it('ignores the triggering actor\'s test effects but keeps its own', async () => {
            const alchemist = await createAlchemist();
            const spellcastingBoost = (name: string, pool: number) => ({
                name,
                system: {
                    targets: [{
                        id: 't', applyTo: 'test_all' as const,
                        conditions: [{ type: 'categories' as const, values: ['spell_combat'] }],
                    }],
                    changes: [
                        { key: 'data.pool', value: `${pool}`, type: 'add' as const, target: 't' },
                        { key: 'data.limit', value: `${pool}`, type: 'add' as const, target: 't' },
                    ],
                },
            });
            await alchemist.createEmbeddedDocuments('ActiveEffect', [spellcastingBoost('Actor Boost', 2)]);

            const created = await createPreparation({}, alchemist);
            await created.createEmbeddedDocuments('ActiveEffect', [spellcastingBoost('Preparation Boost', 1)]);

            const trigger = await TestCreator.fromItem(
                created, alchemist, { showDialog: false, showMessage: false }) as PreparationTriggerTest;
            assert.isOk(trigger);
            await trigger._prepareExecution();

            assert.include(trigger.data.categories, 'spell_combat');
            // Force 4 + Potency 3 + the preparation's own +1, without the actor's +2.
            assert.equal(trigger.pool.value, 8);
            assert.equal(trigger.limit.value, 5);
        });

        it('takes the ranged penalty against a running or sprinting target', async () => {
            const alchemist = await createAlchemist();
            const target = await factory.createActor({ type: 'character' });
            const created = await createPreparation({}, alchemist);

            const poolVsTarget = async () => {
                const trigger = await TestCreator.fromItem(
                    created, alchemist, { showDialog: false, showMessage: false }) as PreparationTriggerTest;
                trigger.targets = [target];
                await trigger._prepareExecution();
                return trigger.pool.value;
            };

            // Force 4 + Potency 3.
            assert.equal(await poolVsTarget(), 7);

            await target.toggleStatusEffect('sr5run', { active: true });
            assert.equal(await poolVsTarget(), 5);

            await target.toggleStatusEffect('sr5run', { active: false });
            await target.toggleStatusEffect('sr5sprint', { active: true });
            assert.equal(await poolVsTarget(), 3);
        });

        it('does not allow a spent preparation to trigger again', async () => {
            const alchemist = await createAlchemist();
            const preparation = await createPreparation({ potency: { base: 0, value: 0 } }, alchemist);
            const trigger = await TestCreator.fromItem(
                preparation, alchemist, { showDialog: false, showMessage: false }) as PreparationTriggerTest;

            await trigger.execute();

            assert.isFalse(trigger.evaluated);
            assert.equal(preparation.system.potency.base, 0);
        });

        it('does not grant a dodge test against a contact-triggered indirect spell', async () => {
            const alchemist = await createAlchemist();
            const defender = await factory.createActor({
                type: 'character',
                system: {
                    attributes: {
                        reaction: { base: 6 },
                        intuition: { base: 6 },
                    }
                }
            });
            const preparation = await createPreparation({
                trigger: 'contact',
                action: { damage: { type: { base: 'physical', value: 'physical' } } },
            }, alchemist);
            const trigger = await TestCreator.fromItem(
                preparation, alchemist, { showDialog: false, showMessage: false }) as PreparationTriggerTest;
            await trigger._prepareExecution();

            const defenseData = await PhysicalDefenseTest._getOpposedActionTestData(
                trigger.data, defender, '');
            if (!defenseData) return assert.fail('Failed to create preparation defense test data');
            const defense = new PhysicalDefenseTest(
                defenseData,
                { actor: defender, source: defender },
                { showDialog: false, showMessage: false }
            );
            await defense._prepareExecution();

            assert.equal(defense.pool.value, 0);
            assert.isFalse(defense.success);
            assert.isFalse(defense.pool.changes.some(change => change.name === 'SR5.MultiDefense'));
        });

        it('rolls a late timed preparation at its scheduled potency', async () => {
            const alchemist = await createAlchemist();
            const preparation = await createPreparation({
                trigger: 'time', triggerTime: { value: 1, unit: 'hours' },
                potency: { base: 2 },
                // Simulate Foundry advancing past both the trigger and expiration in one jump.
                created: { worldTime: game.time.worldTime - 10 * HOUR },
            }, alchemist);

            assert.isTrue(PreparationDecayFlow.isTimeTriggerDue(preparation.system, game.time.worldTime));
            const trigger = await PreparationDecayFlow.triggerTimedPreparation(
                preparation, { showDialog: false, showMessage: false });

            assert.instanceOf(trigger, PreparationTriggerTest);
            assert.isTrue(trigger?.evaluated);
            assert.equal(trigger?.data.potency, 2);
            assert.equal(preparation.system.potency.base, 0);
        });

        it('rolls an Items directory preparation without an actor through to the defense', async () => {
            const defender = await factory.createActor({ type: 'character' });
            const preparation = await createPreparation({
                trigger: 'time', triggerTime: { value: 1, unit: 'hours' },
                created: { worldTime: game.time.worldTime - 2 * HOUR },
                action: { damage: { base: 6, type: { base: 'physical', value: 'physical' } } },
            });

            const trigger = await PreparationDecayFlow.triggerTimedPreparation(
                preparation, { showDialog: false, showMessage: false });

            assert.instanceOf(trigger, PreparationTriggerTest);
            assert.isUndefined(trigger?.actor);
            assert.isTrue(trigger?.evaluated);
            // Force 4 + Potency 3.
            assert.equal(trigger?.pool.value, 7);
            assert.equal(preparation.system.potency.base, 0);

            // An indirect spell from a preparation lying around is dodged like any other.
            const defenseData = await PhysicalDefenseTest._getOpposedActionTestData(
                trigger!.data, defender, '');
            if (!defenseData) return assert.fail('Failed to create preparation defense test data');
            const defense = new PhysicalDefenseTest(
                defenseData,
                { actor: defender, source: defender },
                { showDialog: false, showMessage: false }
            );
            await defense.execute();

            assert.isTrue(defense.evaluated);
            assert.include(defense.data.categories, 'defense');
        });
    });

    describe('Area preparations', () => {
        it('treats only an area spell as an area preparation', async () => {
            assert.isTrue((await createPreparation({ range: 'los_a' })).isAreaOfEffect());
            assert.isFalse((await createPreparation({ range: 'los' })).isAreaOfEffect());
        });

        it('places a template of potency radius that never scatters when triggered', async () => {
            const actor = await factory.createActor({ type: 'character' });
            const created = await createPreparation({ range: 'los_a' }, actor);

            const trigger = await TestCreator.fromItem(
                created, actor, { showDialog: false, showMessage: false }) as PreparationTriggerTest;
            assert.isOk(trigger);
            await trigger._prepareExecution();

            assert.isTrue(trigger.blastTemplateFlow.canPlace);
            // Centered on the preparation, with Potency in meters as radius, not Force. SR5#306.
            assert.deepEqual(trigger.getBlastData(), { radius: 3, dropoff: 0 });
            // The area is centered on the preparation itself, so there is nothing to scatter.
            assert.isFalse(trigger.blastTemplateFlow.canScatter);
        });
    });

    describe('Preparation items', () => {
        it('schedules time triggers in seconds, minutes and hours', async () => {
            for (const [value, unit, seconds] of [[5, 'seconds', 5], [5, 'minutes', 300], [0.5, 'hours', 1800]] as const) {
                const preparation = await createPreparation({ trigger: 'time', triggerTime: { value, unit } });
                const due = preparation.system.created.worldTime + seconds;
                assert.isFalse(PreparationDecayFlow.isTimeTriggerDue(preparation.system, due - 1));
                assert.isTrue(PreparationDecayFlow.isTimeTriggerDue(preparation.system, due));
            }
        });

        it('defaults its creation time to the current world time', async () => {
            const worldTime = game.time.worldTime;
            const preparation = await factory.createItem({ type: 'preparation' });

            assert.equal(preparation.system.created.worldTime, worldTime);
        });

        it('round-trips its creation time through calendar form components', () => {
            const worldTime = game.time.worldTime - 5 * HOUR;
            const components = PreparationTimeDialog.componentsForForm(worldTime);
            const resolved = PreparationTimeDialog.worldTimeFromForm({
                'components.year': components.year,
                'components.month': components.month,
                'components.dayOfMonth': components.dayOfMonth,
                'components.hour': components.hour,
                'components.minute': components.minute,
                'components.second': components.second,
            });

            assert.equal(resolved, Math.floor(worldTime));
        });

        it('uses current world time components for the creation-time shortcut', () => {
            const components = PreparationTimeDialog.componentsForForm(game.time.worldTime);
            const shown = WorldTimeFlow.displayComponents(game.time.worldTime);

            assert.equal(components.year, shown.year);
            assert.equal(components.month, shown.month + 1);
            assert.equal(components.dayOfMonth, shown.dayOfMonth + 1);
            assert.equal(components.hour, shown.hour);
            assert.equal(components.minute, shown.minute);
            assert.equal(components.second, shown.second);
        });

        it('updates creation time and recalculates potency', async () => {
            const preparation = await createPreparation();

            await PreparationTimeDialog.setCreationTime(preparation, game.time.worldTime - 8 * HOUR);

            assert.equal(preparation.system.created.worldTime, game.time.worldTime - 8 * HOUR);
            assert.equal(preparation.system.potency.value, 1);
        });

        it('revives a time-expired preparation when its creation time is corrected', async () => {
            const preparation = await createPreparation({ created: { worldTime: game.time.worldTime - 10 * HOUR } });

            assert.equal(preparation.system.potency.value, 0);

            await PreparationTimeDialog.setCreationTime(preparation, game.time.worldTime);

            assert.equal(preparation.system.potency.value, 3);
        });

        it('derives the current potency during data preparation', async () => {
            const preparation = await createPreparation({ created: { worldTime: game.time.worldTime - 100 * HOUR } });

            // Well past (potency x 3) hours, so nothing is left of it.
            assert.equal(preparation.system.potency.value, 0);
        });

        it('keeps full potency inside the full strength window', async () => {
            const preparation = await createPreparation();

            assert.equal(preparation.system.potency.value, 3);
        });

        it('re-derives potency when preparation sheets refresh after time passes', async () => {
            const preparation = await createPreparation();
            // Stand in for a potency derived at an earlier world time.
            preparation.system.potency.value = 99;

            PreparationDecayFlow.refreshSheets([preparation]);

            assert.equal(preparation.system.potency.value, 3);
        });

        it('recognizes only due timed triggers with potency', async () => {
            const preparation = await createPreparation({ trigger: 'time', triggerTime: { value: 1, unit: 'hours' }, potency: { base: 2 } });

            assert.isFalse(PreparationDecayFlow.isTimeTriggerDue(
                preparation.system, game.time.worldTime + HOUR - 1));
            assert.isTrue(PreparationDecayFlow.isTimeTriggerDue(
                preparation.system, game.time.worldTime + HOUR));

            await preparation.update({ system: { potency: { base: 0, value: 0 } } });
            assert.isFalse(PreparationDecayFlow.isTimeTriggerDue(
                preparation.system, game.time.worldTime + HOUR));
        });

        it('detects only forward crossings of the trigger time', async () => {
            const preparation = await createPreparation({ trigger: 'time', triggerTime: { value: 1, unit: 'hours' } });
            const due = preparation.system.created.worldTime + HOUR;

            assert.isTrue(PreparationDecayFlow.crossedTrigger(preparation.system, due - 1, due));
            assert.isFalse(PreparationDecayFlow.crossedTrigger(preparation.system, due, due + 1));
            assert.isFalse(PreparationDecayFlow.crossedTrigger(preparation.system, due + 1, due - 1));
        });

        it('detects only forward crossings of the expiration boundary', async () => {
            const created = game.time.worldTime;
            const preparation = await createPreparation({ potency: { base: 2 }, created: { worldTime: created } });
            const expiresAt = AlchemyRules.expiresAt(2, created);

            assert.isTrue(PreparationDecayFlow.crossedExpiry(
                preparation.system, expiresAt - 1, expiresAt));
            assert.isFalse(PreparationDecayFlow.crossedExpiry(
                preparation.system, expiresAt, expiresAt + 1));
            assert.isFalse(PreparationDecayFlow.crossedExpiry(
                preparation.system, expiresAt + 1, expiresAt - 1));
        });

        it('finds preparations in the Items directory, on actors and on unlinked tokens once each', async () => {
            const actor = await factory.createActor({ type: 'character' });
            const carried = await createPreparation({}, actor);
            const sidebar = await createPreparation();

            const scene = await factory.createScene({});
            const [token] = await scene.createEmbeddedDocuments('Token', [
                { name: 'First', actorId: actor.id, actorLink: false },
                { name: 'Second', actorId: actor.id, actorLink: false },
            ]) as TokenDocument[];
            const tokenOwned = await createPreparation({}, token.actor as SR5Actor);

            const uuids = PreparationDecayFlow.preparations().map(preparation => preparation.uuid);
            const count = (uuid: string | null) => uuids.filter(other => other === uuid).length;

            assert.equal(count(sidebar.uuid), 1);
            assert.equal(count(carried.uuid), 1);
            assert.equal(count(tokenOwned.uuid), 1);
            // Both tokens inherit the carried preparation, which only the base actor lists.
            const inherited = (uuid: string | null) => !!uuid?.startsWith(`Scene.${scene.id}`) && uuid.endsWith(`Item.${carried.id}`);
            assert.isFalse(uuids.some(inherited));
            assert.isFalse([...PreparationDecayFlow.known].some(inherited));
        });

        it('forgets a deleted preparation', async () => {
            const actor = await factory.createActor({ type: 'character' });
            const preparation = await createPreparation({}, actor);
            const uuid = preparation.uuid!;
            assert.include(PreparationDecayFlow.preparations().map(item => item.uuid), uuid);

            await actor.deleteEmbeddedDocuments('Item', [preparation.id!]);

            assert.notInclude(PreparationDecayFlow.preparations().map(item => item.uuid), uuid);
            assert.isFalse(PreparationDecayFlow.known.has(uuid));
        });

        it('tracks every preparation a full search of the world finds', async () => {
            // The preparations a search through every item, actor and unlinked token finds.
            const found = new Set<string>();
            for (const item of game.items) {
                if (item.type === 'preparation') found.add(item.uuid!);
            }
            for (const actor of game.actors) {
                for (const item of actor.itemTypes.preparation) found.add(item.uuid!);
            }
            for (const scene of game.scenes) {
                for (const token of scene.tokens) {
                    if (token.actorLink || !token.actor || !token.delta) continue;
                    for (const item of token.actor.itemTypes.preparation) {
                        if (token.delta.items.manages(item.id!)) found.add(item.uuid!);
                    }
                }
            }

            const tracked = PreparationDecayFlow.preparations().map(item => item.uuid!);
            assert.sameMembers(tracked, [...found]);
        });

        it('whispers a due card for an Items directory preparation to the GM', async () => {
            const preparation = await createPreparation({ trigger: 'time' });

            const created = new Promise<ChatMessage>(resolve => {
                Hooks.once('createChatMessage', message => resolve(message as ChatMessage));
            });
            await PreparationDecayFlow.announceTrigger(preparation);
            const message = await created;

            try {
                assert.deepEqual(message.whisper, [game.user.id]);
                assert.include(message.content, 'preparation-trigger-roll');
                assert.include(message.content, preparation.uuid!);
                // No actor to show next to the preparation.
                assert.notInclude(message.content, 'header-name');
            } finally {
                await message.delete();
            }
        });

        it('prepares full, decaying, expired, and spent potency states', async () => {
            const created = game.time.worldTime;
            const preparation = await createPreparation({ created: { worldTime: created } });

            const full = preparePreparationPotencyStatus(preparation.system, created);
            const decaying = preparePreparationPotencyStatus(preparation.system, created + 7 * HOUR);
            const expired = preparePreparationPotencyStatus(preparation.system, created + 9 * HOUR);

            await preparation.update({ system: { potency: { base: 0, value: 0 } } });
            const spent = preparePreparationPotencyStatus(preparation.system, created);

            // Progress counts down the remaining lifetime of potency x 3 hours.
            assert.include(full, { state: 'full', progressValue: 9 * HOUR, progressMax: 9 * HOUR });
            assert.include(decaying, { state: 'decaying', progressValue: 2 * HOUR, progressMax: 9 * HOUR });
            assert.include(expired, { state: 'expired', progressValue: 0 });
            assert.include(spent, { state: 'spent', progressValue: 0, progressMax: 1 });
            assert.closeTo(full.decayThresholdPercent, 100 / 3, 0.001);
            assert.include(full.tooltip, WorldTimeFlow.format(AlchemyRules.expiresAt(3, created)));
        });

        it('removes inert from the preparation schema', () => {
            const fields = CONFIG.Item.dataModels['preparation'].schema.fields as Record<string, unknown>;
            assert.notProperty(fields, 'inert');
        });

        it('labels its inherited spell fields', async () => {
            // The preparation schema pulls in the spell fields, whose labels live under
            // SR5.Spell.FIELDS. Without the chained localization prefix these render blank.
            const fields = CONFIG.Item.dataModels['preparation'].schema.fields as Record<string, any>;

            assert.equal(fields.category.label, 'Category');
            assert.isNotEmpty(fields.combat.fields.type.label);
            assert.isNotEmpty(fields.drain.label);
            // The preparation's own fields must still win over the donor prefixes.
            assert.equal(fields.force.label, 'Force');
            assert.isNotEmpty(fields.potency.fields.base.label);
        });

        it('carries the spell fields a spell item carries', async () => {
            const preparation = await createPreparation({ type: 'mana', combat: { type: 'direct' } });

            // The defense chain resolves a triggered preparation through this accessor.
            assert.isDefined(preparation.spellPart);
            assert.equal(preparation.spellPart?.category, 'combat');
            assert.equal(preparation.spellPart?.combat.type, 'direct');
        });

        it('configures the trigger test on creation', async () => {
            const preparation = await createPreparation();

            assert.equal(preparation.system.action.test, 'PreparationTriggerTest');
            assert.equal(preparation.system.action.opposed.test, 'PhysicalDefenseTest');
            assert.equal(preparation.system.action.opposed.resist.test, 'PhysicalResistTest');
            // Drain was already paid at creation. SR5#306.
            assert.equal(preparation.system.action.followed.test, '');
        });
    });
};
