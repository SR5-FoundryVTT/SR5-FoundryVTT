import { QuenchBatchContext } from "@ethaks/fvtt-quench";
import { SR5Item } from "../module/item/SR5Item";
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

    before(async () => {})
    after(async () => {});

    describe('TechnologyData preparation', () => {
        it('Calculate the correct device item condition monitor', async () => {
            const device = await SR5Item.create({ type: 'device', name: 'QUENCH' }) as SR5Item<'device'>;
            
            device.system.technology.rating = 4;
            TechnologyPrep.prepareConditionMonitor(device.system.technology);

            assert.equal(device.system.technology.condition_monitor.max, 10);

            await device.delete();
        });
        it('Calculate the correct device item condition monitor for rounded values', async () => {
            const device = await SR5Item.create({ type: 'device', name: 'QUENCH' }) as SR5Item<'device'>;

            device.system.technology.rating = 5;
            TechnologyPrep.prepareConditionMonitor(device.system.technology);

            assert.equal(device.system.technology.condition_monitor.max, 11);

            await device.delete();
        });
        it('Calculate a condition monitor for devices with malformed technology data', async () => {
            const device = await SR5Item.create({ type: 'device', name: 'QUENCH' }) as SR5Item<'device'>;
            
            device.system.technology.rating = 4;
            // @ts-expect-error // test-case makes this necessary
            device.technology.condition_monitor = undefined;
            TechnologyPrep.prepareConditionMonitor(device.system.technology);

            assert.equal(device.system.technology.condition_monitor.max, 10);

            await device.delete();
        });

        it('Calculate conceal data for a device', async () => {
            const device = await SR5Item.create({ type: 'device', name: 'QUENCH' }) as SR5Item<'device'>;
            const mods: SR5Item<'modification'>[] = [];

            // prepareConceal relies on the item name to be unique.
            mods.push(new SR5Item<'modification'>({type: 'modification', name: 'UniqueNameA', system: {conceal: 2}}));
            mods.push(new SR5Item<'modification'>({type: 'modification', name: 'UniqueNameB', system: {conceal: 4}}));
            
            TechnologyPrep.prepareConceal(device.system.technology, mods);

            assert.equal(device.system.technology.conceal.value, 6);
            assert.equal(device.system.technology.conceal.mod.length, 2);

            await device.delete();
        });
    });

    describe('ActionRollData preparation', () => {
        it('Check for damage base_formula_operator migration', async () => {
            const action = await SR5Item.create({type: 'action', name: 'TestAction'}) as SR5Item<'action'>;
            action.system.action.damage.base_formula_operator = 'add';

            ActionPrep.prepareWithMods(action.system.action, []);

            assert.equal(action.system.action.damage.base_formula_operator, 'add');
            await action.delete();
        });

        it('Setup damage source data', async () => {
            const character = await SR5Actor.create({ name: 'QUENCH', type: 'character' }) as SR5Actor<'character'>;
            const documents = (await character.createEmbeddedDocuments('Item', [{type: 'action', name: 'TestAction'}]))!;
            const action = documents[0] as SR5Item<'action'>;

            ActionPrep.prepareDamageSource(action.system.action, action)

            assert.deepEqual(action.system.action?.damage.source, {
                actorId: character.id as string,
                itemId: action.id as string,
                itemName: action.name,
                itemType: action.type
            })

            await character.delete();
        });

        it('Check for weapon modification setting dice pool modifiers', async () => {
            const weapon = await SR5Item.create({type: 'weapon', name: 'Test'}) as SR5Item<'weapon'>;
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
            const weapon = await SR5Item.create({type: 'weapon', name: 'QUENCH'}) as SR5Item<'weapon'>;
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
            const weapon = await SR5Item.create({type: 'weapon', name: 'QUENCH'}) as SR5Item<'weapon'>;
            const ammo = await SR5Item.create({type: 'ammo', name: 'QUENCH', system: {damage: 2}}) as SR5Item<'ammo'>;
            
            ActionPrep.prepareWithAmmo(weapon.system.action, ammo);
            ActionPrep.calculateValues(weapon.system.action);

            assert.strictEqual(weapon.system.action?.damage.value, 2);
        });

        it('Check for ammo to modify the weapon armor piercing', async () => {
            const weapon = await SR5Item.create({type: 'weapon', name: 'QUENCH'}) as SR5Item<'weapon'>;
            const ammo = await SR5Item.create({type: 'ammo', name: 'QUENCH', system: {ap: -2}}) as SR5Item<'ammo'>;
            
            ActionPrep.prepareWithAmmo(weapon.system.action, ammo);
            ActionPrep.calculateValues(weapon.system.action);

            assert.strictEqual(weapon.system.action?.damage.ap.value, -2);
        });

        it('Check for ammo to override the weapon damage info', async () => {
            const weapon = await SR5Item.create({
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
            }) as SR5Item<'weapon'>;

            const ammo = await SR5Item.create({
                type: 'ammo',
                name: 'TestModA',
                system: {
                    replaceDamage: true,
                    damage: 2,
                    damageType: 'stun',
                    element: 'cold'
                }
            }) as SR5Item<'ammo'>;

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
            const weapon = await SR5Item.create({type: 'weapon', name: 'Test', system: {range: {rc: {value: 2}}}}) as SR5Item<'weapon'>;
            const mods: SR5Item<'modification'>[] = [];
            mods.push(await SR5Item.create({type: 'modification', name: 'TestModA', system: {type: 'weapon', rc: 2}}) as SR5Item<'modification'>);

            RangePrep.prepareRecoilCompensation(weapon.system.range, mods);

            assert.strictEqual(weapon.system.range.rc.base, 2);
            assert.strictEqual(weapon.system.range.rc.mod.length, 1);
            assert.strictEqual(weapon.system.range.rc.value, 4);

            await weapon.delete();
        });
    });
}