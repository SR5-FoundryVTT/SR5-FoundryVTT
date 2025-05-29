import { QuenchBatchContext } from "@ethaks/fvtt-quench";
import { SR5Item } from "../module/item/SR5Item";
import { SR5TestingDocuments } from "./utils";
import { TechnologyPrep } from "../module/item/prep/functions/TechnologyPrep";
import { ActionPrep } from "../module/item/prep/functions/ActionPrep";
import { SR5Actor } from "../module/actor/SR5Actor";
import { RangePrep } from "../module/item/prep/functions/RangePrep";

/**
 * Tests involving data preparation for SR5Item types.
 */
export const shadowrunSR5ItemDataPrep = (context: QuenchBatchContext) => {
    const {describe, it, before, after} = context;
    const assert: Chai.AssertStatic = context.assert;

    let testItem: SR5TestingDocuments<SR5Item>;
    let testActor: SR5TestingDocuments<SR5Actor>;

    before(async () => {
        testItem = new SR5TestingDocuments(SR5Item);
        testActor = new SR5TestingDocuments(SR5Actor);
    })

    after(async () => {
        await testItem.teardown();
        await testActor.teardown();
    });

    describe('TechnologyData preparation', () => {
        it('Calculate the correct device item condition monitor', async () => {
            const device = new SR5Item<'device'>({type: 'device', name: 'TestDevice'});
            
            device.technology.rating = 4;
            TechnologyPrep.prepareConditionMonitor(device.technology);

            assert.equal(device.technology.condition_monitor.max, 10);

            await device.delete();
        });
        it('Calculate the correct device item condition monitor for rounded values', async () => {
            const device = new SR5Item<'device'>({type: 'device', name: 'TestDevice'});

            device.technology.rating = 5;
            TechnologyPrep.prepareConditionMonitor(device.technology);

            assert.equal(device.technology.condition_monitor.max, 11);

            await device.delete();
        });
        it('Calculate a condition monitor for devices with malformed technology data', async () => {
            const device = new SR5Item<'device'>({type: 'device', name: 'TestDevice'});
            
            device.technology.rating = 4;
            // @ts-expect-error // test-case makes this necessary
            device.technology.condition_monitor = undefined;
            TechnologyPrep.prepareConditionMonitor(device.technology);

            assert.equal(device.technology.condition_monitor.max, 10);

            await device.delete();
        });

        it('Calculate conceal data for a device', async () => {
            const device = new SR5Item<'device'>({type: 'device', name: 'TestDevice'});
            const mods: SR5Item<'modification'>[] = [];

            // prepareConceal relies on the item name to be unique.
            mods.push(new SR5Item<'modification'>({type: 'modification', name: 'UniqueNameA', system: {conceal: 2}}));
            mods.push(new SR5Item<'modification'>({type: 'modification', name: 'UniqueNameB', system: {conceal: 4}}));
            
            TechnologyPrep.prepareConceal(device.technology, mods);

            assert.equal(device.technology.conceal.value, 6);
            assert.equal(device.technology.conceal.mod.length, 2);

            await device.delete();
        });
    });

    describe('ActionRollData preparation', () => {
        it('Check for damage base_formula_operator migration', async () => {
            const action = new SR5Item<'action'>({type: 'action', name: 'TestAction'});
            action.action.damage.base_formula_operator = '+';

            ActionPrep.prepareWithMods(action.action, []);

            assert.equal(action.action.damage.base_formula_operator, 'add');
            await action.delete();
        });

        it('Setup damage source data', async () => {
            const actor = new SR5Actor<'character'>({type: 'character'});
            const documents = await actor.createEmbeddedDocuments('Item', [{type: 'action', name: 'TestAction'}]);
            const action = documents[0] as SR5Item<'action'>;

            ActionPrep.prepareDamageSource(action.system.action, action)

            assert.deepEqual(action.system.action?.damage.source, {
                actorId: actor.id as string,
                itemId: action.id as string,
                itemName: action.name as string,
                itemType: action.type
            })

            await actor.delete();
        });

        it('Check for weapon modification setting dice pool modifiers', async () => {
            const weapon = new SR5Item<'weapon'>({type: 'weapon', name: 'Test'});
            // unique names are necessary
            const mods: SR5Item<'modification'>[] = [];
            mods.push(new SR5Item<'modification'>({type: 'modification', name: 'TestModA', system: {type: 'weapon', dice_pool: 2}}));
            mods.push(new SR5Item<'modification'>({type: 'modification', name: 'TestModB', system: {type: 'weapon', dice_pool: 4}}));

            ActionPrep.prepareWithMods(weapon.system.action, mods);
            ActionPrep.calculateValues(weapon.system.action);

            assert.strictEqual(weapon.system.action?.dice_pool_mod.length, 2);
            await weapon.delete();
        });

        it('Check for weapon modification setting limit modifiers', async () => {
            const weapon = new SR5Item<'weapon'>({type: 'weapon', name: 'Test'});
            // unique names are necessary
            const mods: SR5Item<'modification'>[] = [];
            mods.push(new SR5Item<'modification'>({type: 'modification', name: 'TestModA', system: {type: 'weapon', accuracy: 2}}));
            mods.push(new SR5Item<'modification'>({type: 'modification', name: 'TestModB', system: {type: 'weapon', accuracy: 4}}));

            ActionPrep.prepareWithMods(weapon.system.action, mods);
            ActionPrep.calculateValues(weapon.system.action);

            assert.strictEqual(weapon.system.action?.limit.mod.length, 2);
            await weapon.delete();
        });

        it('Check for ammo to apply its damage to the weapon', async () => {
            const weapon = new SR5Item<'weapon'>({type: 'weapon', name: 'Test'});
            const ammo = new SR5Item<'ammo'>({type: 'ammo', name: 'TestModA', system: {damage: 2}});
            
            ActionPrep.prepareWithAmmo(weapon.system.action, ammo);
            ActionPrep.calculateValues(weapon.system.action);

            assert.strictEqual(weapon.system.action?.damage.value, 2);
        });

        it('Check for ammo to modify the weapon armor piercing', async () => {
            const weapon = new SR5Item<'weapon'>({type: 'weapon', name: 'Test'});
            const ammo = new SR5Item<'ammo'>({type: 'ammo', name: 'TestModA', system: {ap: -2}});
            
            ActionPrep.prepareWithAmmo(weapon.system.action, ammo);
            ActionPrep.calculateValues(weapon.system.action);

            assert.strictEqual(weapon.system.action?.damage.ap.value, -2);
        });

        it('Check for ammo to override the weapon damage info', async () => {
            const weapon = new SR5Item<'weapon'>({
                type: 'weapon',
                name: 'Test',
                system: {
                    action: {
                        damage: {
                            element: {value: 'fire'}, 
                            base: 3,
                            type: {base: 'physical'}
                        }
                    }
                }
            });

            const ammo = new SR5Item<'ammo'>({
                type: 'ammo',
                name: 'TestModA',
                system: {
                    replaceDamage: true,
                    damage: 2,
                    damageType: 'stun',
                    element: 'cold'
                }
            });

            ActionPrep.prepareWithAmmo(weapon.system.action, ammo);
            ActionPrep.calculateValues(weapon.system.action);

            assert.strictEqual(weapon.system.action?.damage.base, 3);
            assert.strictEqual(weapon.system.action?.damage.value, 2);
            assert.strictEqual(weapon.system.action?.damage.type.base, 'physical');
            assert.strictEqual(weapon.system.action?.damage.type.value, 'stun');
            assert.strictEqual(weapon.system.action?.damage.element.base, '');
            assert.strictEqual(weapon.system.action?.damage.element.value, 'cold');
        });
    });

    describe('RangeData preparation', () => {
        it('Check for weapon modification recoil modifiers', async () => {
            const weapon = new SR5Item<'weapon'>({type: 'weapon', name: 'Test', system: {range: {rc: {value: 2}}}});
            const mods: SR5Item[] = [];
            mods.push(new SR5Item({type: 'modification', name: 'TestModA', system: {type: 'weapon', rc: 2}}));

            RangePrep.prepareRecoilCompensation(weapon.system.range, mods);

            assert.strictEqual(weapon.system.range.rc.base, 2);
            assert.strictEqual(weapon.system.range.rc.mod.length, 1);
            assert.strictEqual(weapon.system.range.rc.value, 4);

            await weapon.delete();
        });
    });
}