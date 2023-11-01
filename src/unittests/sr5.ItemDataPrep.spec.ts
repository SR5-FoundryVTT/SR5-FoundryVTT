import { QuenchBatchContext } from "@ethaks/fvtt-quench";
import { SR5Item } from "../module/item/SR5Item";
import { SR5TestingDocuments } from "./utils";
import { TechnologyPrep } from "../module/item/prep/functions/TechnologyPrep";
import { ActionPrep } from "../module/item/prep/functions/ActionPrep";
import { SR5Actor } from "../module/actor/SR5Actor";

/**
 * Tests involving data preparation for SR5Item types.
 */
export const shadowrunSR5ItemDataPrep = (context: QuenchBatchContext) => {
    const {describe, it, assert, before, after} = context;

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
        it('Calculate the correct device item condition monitor', () => {
            const device = foundry.utils.duplicate(game.model.Item.device) as Shadowrun.DeviceData;
            
            device.technology.rating = 4;
            TechnologyPrep.prepareConditionMonitor(device.technology);

            assert.equal(device.technology.condition_monitor.max, 10);
        });
        it('Calculate the correct device item condition monitor for rounded values', () => {
            const device = foundry.utils.duplicate(game.model.Item.device) as Shadowrun.DeviceData;
            
            device.technology.rating = 5;
            TechnologyPrep.prepareConditionMonitor(device.technology);

            assert.equal(device.technology.condition_monitor.max, 11);
        });
        it('Calculate a condition monitor for devices with malformed technology data', () => {
            const device = foundry.utils.duplicate(game.model.Item.device) as Shadowrun.DeviceData;
            
            device.technology.rating = 4;
            // @ts-expect-error // test-case makes this necessary
            device.technology.condition_monitor = undefined;
            TechnologyPrep.prepareConditionMonitor(device.technology);

            assert.equal(device.technology.condition_monitor.max, 10);
        });

        it('Calculate conceal data for a device', async () => {
            const device = foundry.utils.duplicate(game.model.Item.device) as Shadowrun.DeviceData;
            const mods: SR5Item[] = [];
            
            // prepareConceal relies on the item name to be unique.
            mods.push(await testItem.create({type: 'modification', name: 'UniqueNameA', system: {conceal: 2}}));
            mods.push(await testItem.create({type: 'modification', name: 'UniqueNameB', system: {conceal: 4}}));
            
            TechnologyPrep.prepareConceal(device.technology, mods);

            assert.equal(device.technology.conceal.value, 6);
            assert.equal(device.technology.conceal.mod.length, 2);
        });
    });

    describe('ActionRollData preparation', () => {
        it('Check for damage base_formula_operator migration', () => {
            const action = foundry.utils.duplicate(game.model.Item.action) as Shadowrun.ActionData;
            // @ts-expect-error // test-case makes this necessary
            action.action.damage.base_formula_operator = '+';
            
            ActionPrep.prepareWithMods(action.action, []);

            assert.equal(action.action.damage.base_formula_operator, 'add');
        });

        it('Setup damage source data', async () => {
            const actor = await testActor.create({type: 'character'});
            const documents = await actor.createEmbeddedDocuments('Item', [{type: 'action', name: 'TestAction'}]);
            const action = documents[0] as SR5Item;

            ActionPrep.prepareDamageSource(action.system.action as Shadowrun.ActionRollData, action)

            assert.deepEqual(action.system.action?.damage.source, {
                actorId: actor.id as string,
                itemId: action.id as string,
                itemName: action.name as string,
                itemType: action.type
            })
        });

        it('Check weapon modification accuracy override', async () => {
            const weapon = await testItem.create({type: 'weapon'});
            // unique names are necessary
            await weapon.createNestedItem({type: 'modification', name: 'TestModA', system: {type: 'weapon', accuracy: 2}});
            await weapon.createNestedItem({type: 'modification', name: 'TestModB', system: {type: 'weapon', accuracy: 4}});

            ActionPrep.prepareWithMods(weapon.system.action as Shadowrun.ActionRollData, weapon.items.filter(item => item.type === 'modification'));
            
            assert.strictEqual(weapon.system.action?.limit.value, 6);
            assert.strictEqual(weapon.system.action?.limit.mod.length, 2);
        });

        it('Check for weapon modification dice pool mod override', async () => {
            const weapon = await testItem.create({type: 'weapon'});
            // unique names are necessary
            await weapon.createNestedItem({type: 'modification', name: 'TestModA', system: {type: 'weapon', dice_pool: 2, equipped: true}});
            await weapon.createNestedItem({type: 'modification', name: 'TestModB', system: {type: 'weapon', dice_pool: 4, equipped: true}});

            ActionPrep.prepareWithMods(weapon.system.action as Shadowrun.ActionRollData, weapon.items.filter(item => item.type === 'modification'));
            
            // NOTE: I expect this to fail, as this doesn't seem to work?
            assert.strictEqual(weapon.system.action?.mod, 6);
            assert.strictEqual(weapon.system.action?.dice_pool_mod.length, 2);
        });

        it('Check for ammo to apply its damage to the weapon', async () => {
            const weapon = await testItem.create({type: 'weapon'});

            // unique names are necessary
            await weapon.createNestedItem({type: 'ammo', name: 'TestAmmoA', system: {equipped: true}});
            
            ActionPrep.prepareWithAmmo(weapon.system.action as Shadowrun.ActionRollData, weapon.items.find(item => item.type === 'ammo' && item.isEquipped));

            assert.strictEqual(weapon.system.action?.damage.value, 6);
        });

        it('Check for ammo to override its damage to the weapon', async () => {
            assert.fail();
        });

        it('Check for ammo to modify the weapon armor piercing', async () => {
            assert.fail();
        });

        it('Check for ammo to modify the weapon accuracy', async () => {
            assert.fail();
        });

        it('Check for ammo to override the weapon damage element type', async () => {
            assert.fail();
        });

        it('Check for ammo to override the weapon damage type', async () => {
            assert.fail();
        });
    });
}