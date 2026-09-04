import { QuenchBatchContext } from "@ethaks/fvtt-quench";
import { AlchemyRules } from "../module/rules/AlchemyRules";
import { PreparationDecayFlow } from "../module/flows/PreparationDecayFlow";
import { SR5TestFactory } from "./utils";
import { TestCreator } from "../module/tests/TestCreator";
import { PreparationCreationTest } from "../module/tests/PreparationCreationTest";
import { PreparationTriggerTest } from "../module/tests/PreparationTriggerTest";
import { OpposedPreparationForceTest } from "../module/tests/OpposedPreparationForceTest";
import { SR5Actor } from "../module/actor/SR5Actor";
import { SR5Item } from "../module/item/SR5Item";

const HOUR = 3600;

/**
 * Alchemical preparation rules as described on SR5#304-306 and SG#209-210.
 */
export const shadowrunAlchemy = (context: QuenchBatchContext) => {
    const factory = new SR5TestFactory();
    const { describe, it, after } = context;
    const assert: Chai.AssertStatic = context.assert;

    after(async () => { await factory.destroy(); });

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
            assert.equal(AlchemyRules.activationPool(5, 6), 11);
        });

        it('sustains for potency minutes', () => {
            assert.equal(AlchemyRules.sustainedMinutes(6), 6);
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
            assert.equal(AlchemyRules.activationPool(force, netHits), 11);
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
                    combat: { type: 'indirect' }
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
            assert.equal(mundane.system.action.opposed.test, 'CombatSpellDefenseTest');
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

        it('triggers on force plus potency and consumes the preparation', async () => {
            const alchemist = await createAlchemist();
            const [created] = await alchemist.createEmbeddedDocuments('Item', [{
                name: 'Prepared Fireball', type: 'preparation',
                system: {
                    category: 'combat', type: 'physical', combat: { type: 'indirect' },
                    force: 4, trigger: 'contact', drain: -1,
                    potency: { base: 3 },
                    created: { worldTime: game.time.worldTime },
                }
            }]) as SR5Item[];
            const preparation = created as SR5Item<'preparation'>;

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
            assert.isTrue(preparation.system.inert);
            assert.equal(preparation.system.potency.value, 0);
        });
    });

    describe('Preparation items', () => {
        it('derives the current potency during data preparation', async () => {
            const preparation = await factory.createItem({
                type: 'preparation',
                system: {
                    category: 'combat',
                    force: 4,
                    trigger: 'contact',
                    potency: { base: 3 },
                    created: { worldTime: game.time.worldTime - 100 * HOUR },
                }
            });

            // Well past (potency x 3) hours, so nothing is left of it.
            assert.equal(preparation.system.potency.value, 0);
        });

        it('keeps full potency inside the full strength window', async () => {
            const preparation = await factory.createItem({
                type: 'preparation',
                system: {
                    category: 'combat',
                    force: 4,
                    potency: { base: 3 },
                    created: { worldTime: game.time.worldTime },
                }
            });

            assert.equal(preparation.system.potency.value, 3);
        });

        it('reports an expired preparation as ready to retire', async () => {
            const preparation = await factory.createItem({
                type: 'preparation',
                system: {
                    category: 'combat',
                    potency: { base: 2 },
                    created: { worldTime: game.time.worldTime - 100 * HOUR },
                }
            });

            assert.isTrue(PreparationDecayFlow.hasExpired(preparation.system, game.time.worldTime));
        });

        it('does not report a fresh or already inert preparation', async () => {
            const fresh = await factory.createItem({
                type: 'preparation',
                system: { potency: { base: 2 }, created: { worldTime: game.time.worldTime } }
            });
            assert.isFalse(PreparationDecayFlow.hasExpired(fresh.system, game.time.worldTime));

            const inert = await factory.createItem({
                type: 'preparation',
                system: {
                    inert: true,
                    potency: { base: 2 },
                    created: { worldTime: game.time.worldTime - 100 * HOUR }
                }
            });
            assert.isFalse(PreparationDecayFlow.hasExpired(inert.system, game.time.worldTime));
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
            const preparation = await factory.createItem({
                type: 'preparation',
                system: { category: 'combat', type: 'mana', combat: { type: 'direct' } }
            });

            // The defense chain resolves a triggered preparation through this accessor.
            assert.isDefined(preparation.spellPart);
            assert.equal(preparation.spellPart?.category, 'combat');
            assert.equal(preparation.spellPart?.combat.type, 'direct');
        });

        it('configures the trigger test on creation', async () => {
            const preparation = await factory.createItem({
                type: 'preparation',
                system: { category: 'combat', combat: { type: 'indirect' } }
            });

            assert.equal(preparation.system.action.test, 'PreparationTriggerTest');
            assert.equal(preparation.system.action.opposed.test, 'CombatSpellDefenseTest');
            assert.equal(preparation.system.action.opposed.resist.test, 'PhysicalResistTest');
            // Drain was already paid at creation. SR5#306.
            assert.equal(preparation.system.action.followed.test, '');
        });
    });
};
