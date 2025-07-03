import { SR5TestFactory } from "./util";
import { SR5Item } from "../module/item/SR5Item";
import { QuenchBatchContext } from "@ethaks/fvtt-quench";
import { RangePrep } from "../module/item/prep/functions/RangePrep";
import { ActionPrep } from "../module/item/prep/functions/ActionPrep";
import { TechnologyPrep } from "../module/item/prep/functions/TechnologyPrep";

/**
 * Tests involving data preparation for SR5Item types.
 */
export const shadowrunSR5ItemDataPrep = (context: QuenchBatchContext) => {
    const factory = new SR5TestFactory();
    const { describe, it, after } = context;
    const assert: Chai.AssertStatic = context.assert;

    after(async () => { factory.destroy(); });

    describe('TechnologyData preparation', () => {
        it('Calculate the correct device item condition monitor', async () => {
            const device = await factory.createItem({ type: 'device' });
            
            device.system.technology.rating = 4;
            TechnologyPrep.prepareConditionMonitor(device.system.technology);

            assert.equal(device.system.technology.condition_monitor.max, 10);
        });
        it('Calculate the correct device item condition monitor for rounded values', async () => {
            const device = await factory.createItem({ type: 'device' });

            device.system.technology.rating = 5;
            TechnologyPrep.prepareConditionMonitor(device.system.technology);

            assert.equal(device.system.technology.condition_monitor.max, 11);
        });
        it('Calculate a condition monitor for devices with malformed technology data', async () => {
            const device = await factory.createItem({ type: 'device'});
            
            device.system.technology.rating = 4;
            // @ts-expect-error // test-case makes this necessary
            device.technology.condition_monitor = undefined;
            TechnologyPrep.prepareConditionMonitor(device.system.technology);

            assert.equal(device.system.technology.condition_monitor.max, 10);
        });

        it('Calculate conceal data for a device', async () => {
            const device = await factory.createItem({ type: 'device' });
            const mods: SR5Item<'modification'>[] = [];

            // prepareConceal relies on the item name to be unique.
            mods.push(await factory.createItem({type: 'modification', system: {conceal: 2}}));
            mods.push(await factory.createItem({type: 'modification', system: {conceal: 4}}));
            
            TechnologyPrep.prepareConceal(device.system.technology, mods);

            assert.equal(device.system.technology.conceal.value, 6);
            assert.equal(device.system.technology.conceal.mod.length, 2);
        });
    });

    describe('ActionRollData preparation', () => {
        it('Check for damage base_formula_operator migration', async () => {
            const action = await factory.createItem({type: 'action' });
            action.system.action.damage.base_formula_operator = 'add';

            ActionPrep.prepareWithMods(action.system.action, []);

            assert.equal(action.system.action.damage.base_formula_operator, 'add');
        });

        it('Setup damage source data', async () => {
            const character = await factory.createActor({ type: 'character' });
            const documents = (await character.createEmbeddedDocuments('Item', [{type: 'action', name: 'TestAction'}]))!;
            const action = documents[0] as SR5Item<'action'>;

            ActionPrep.prepareDamageSource(action.system.action, action)

            assert.deepEqual(action.system.action?.damage.source, {
                actorId: character.id!,
                itemId: action.id!,
                itemName: action.name,
                itemType: action.type
            })
        });

        it('Check for weapon modification setting dice pool modifiers', async () => {
            const weapon = await factory.createItem({type: 'weapon' });
            // unique names are necessary
            const mods: SR5Item<'modification'>[] = [];
            mods.push(await factory.createItem({type: 'modification', system: {type: 'weapon', dice_pool: 2}}));
            mods.push(await factory.createItem({type: 'modification', system: {type: 'weapon', dice_pool: 4}}));

            ActionPrep.prepareWithMods(weapon.system.action, mods);
            ActionPrep.calculateValues(weapon.system.action);

            assert.strictEqual(weapon.system.action?.dice_pool_mod.length, 2);
        });

        it('Check for weapon modification setting limit modifiers', async () => {
            const weapon = await factory.createItem({type: 'weapon' });
            // unique names are necessary
            const mods: SR5Item<'modification'>[] = [];
            mods.push(await factory.createItem({type: 'modification', system: {type: 'weapon', accuracy: 2}}));
            mods.push(await factory.createItem({type: 'modification', system: {type: 'weapon', accuracy: 4}}));

            ActionPrep.prepareWithMods(weapon.system.action, mods);
            ActionPrep.calculateValues(weapon.system.action);

            assert.strictEqual(weapon.system.action?.limit.mod.length, 2);
        });

        it('Check for ammo to apply its damage to the weapon', async () => {
            const weapon = await factory.createItem({type: 'weapon' });
            const ammo = await factory.createItem({type: 'ammo', system: {damage: 2}});
            
            ActionPrep.prepareWithAmmo(weapon.system.action, ammo);
            ActionPrep.calculateValues(weapon.system.action);

            assert.strictEqual(weapon.system.action?.damage.value, 2);
        });

        it('Check for ammo to modify the weapon armor piercing', async () => {
            const weapon = await factory.createItem({type: 'weapon' });
            const ammo = await factory.createItem({type: 'ammo', system: {ap: -2}});
            
            ActionPrep.prepareWithAmmo(weapon.system.action, ammo);
            ActionPrep.calculateValues(weapon.system.action);

            assert.strictEqual(weapon.system.action?.damage.ap.value, -2);
        });

        it('Check for ammo to override the weapon damage info', async () => {
            const weapon = await factory.createItem({
                type: 'weapon',
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

            const ammo = await factory.createItem({
                type: 'ammo',
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
            const weapon = await factory.createItem({type: 'weapon', system: {range: {rc: {value: 2}}}});
            const mods: SR5Item<'modification'>[] = [];
            mods.push(await factory.createItem({type: 'modification', system: {type: 'weapon', rc: 2}}));

            RangePrep.prepareRecoilCompensation(weapon.system.range, mods);

            assert.strictEqual(weapon.system.range.rc.base, 2);
            assert.strictEqual(weapon.system.range.rc.mod.length, 1);
            assert.strictEqual(weapon.system.range.rc.value, 4);
        });
    });
}
