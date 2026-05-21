import { SR5TestFactory } from "./utils";
import { SR5Item } from "../module/item/SR5Item";
import { QuenchBatchContext } from "@ethaks/fvtt-quench";
import { RangePrep } from "../module/item/prep/functions/RangePrep";
import { ActionPrep } from "../module/item/prep/functions/ActionPrep";
import { TechnologyPrep } from "../module/item/prep/functions/TechnologyPrep";
import { ArmorPrep } from "../module/item/prep/functions/ArmorPrep";

/**
 * Tests involving data preparation for SR5Item types.
 */
export const shadowrunSR5ItemDataPrep = (context: QuenchBatchContext) => {
    const factory = new SR5TestFactory();
    const { describe, it, after } = context;
    const assert: Chai.AssertStatic = context.assert;

    after(async () => { await factory.destroy(); });

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
            TechnologyPrep.prepareConditionMonitor(device.system.technology);

            assert.equal(device.system.technology.condition_monitor.max, 10);
        });

        it('Calculate conceal data for a device', async () => {
            const device = await factory.createItem({ type: 'device' });
            const mods: SR5Item<'modification'>[] = [];

            // prepareConceal relies on the item name to be unique.
            mods.push(await factory.createItem({name: 'modA', type: 'modification', system: {type: 'weapon', mod_weapon: {conceal: 2}}}));
            mods.push(await factory.createItem({name: 'modB', type: 'modification', system: {type: 'weapon', mod_weapon: {conceal: 4}}}));

            TechnologyPrep.prepareConceal(device.system.technology, mods);

            assert.equal(device.system.technology.conceal.value, 6);
            assert.equal(device.system.technology.conceal.changes.length, 2);
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
            const documents = await character.createEmbeddedDocuments('Item', [{type: 'action', name: 'TestAction'}]);
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
            mods.push(await factory.createItem({name: 'modA', type: 'modification', system: {type: 'weapon', mod_weapon: {dice_pool: 2}}}));
            mods.push(await factory.createItem({name: 'modB', type: 'modification', system: {type: 'weapon', mod_weapon: {dice_pool: 4}}}));

            ActionPrep.prepareWithMods(weapon.system.action, mods);
            ActionPrep.calculateValues(weapon.system.action);

            assert.strictEqual(weapon.system.action?.dice_pool_mod.length, 2);
        });

        it('Check for weapon modification setting limit modifiers', async () => {
            const weapon = await factory.createItem({type: 'weapon' });
            // unique names are necessary
            const mods: SR5Item<'modification'>[] = [];
            mods.push(await factory.createItem({name: 'modA', type: 'modification', system: {type: 'weapon', mod_weapon: {accuracy: 2}}}));
            mods.push(await factory.createItem({name: 'modB', type: 'modification', system: {type: 'weapon', mod_weapon: {accuracy: 4}}}));

            ActionPrep.prepareWithMods(weapon.system.action, mods);
            ActionPrep.calculateValues(weapon.system.action);

            assert.strictEqual(weapon.system.action?.limit.changes.length, 2);
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

            assert.strictEqual(weapon.system.action.damage.base, 3);
            assert.strictEqual(weapon.system.action.damage.value, 2);
            assert.strictEqual(weapon.system.action.damage.type.base, 'physical');
            assert.strictEqual(weapon.system.action.damage.type.value, 'stun');
            assert.strictEqual(weapon.system.action.damage.element.base, '');
            assert.strictEqual(weapon.system.action.damage.element.value, 'cold');
        });
    });

    describe('RangeData preparation', () => {
        it('Check for weapon modification recoil modifiers', async () => {
            const weapon = await factory.createItem({type: 'weapon', system: {range: {rc: {base: 2}}}});
            const mods: SR5Item<'modification'>[] = [];
            mods.push(await factory.createItem({name: 'modA', type: 'modification', system: {type: 'weapon', mod_weapon: {rc: 2}}}));

            RangePrep.prepareRecoilCompensation(weapon.system.range, mods);

            assert.strictEqual(weapon.system.range.rc.base, 2);
            assert.strictEqual(weapon.system.range.rc.changes.length, 1);
            assert.strictEqual(weapon.system.range.rc.value, 4);
        });
    });

    describe('ArmorData preparation', () => {
        it('applies equipped armor modification values to armor rating, elements, immunities, and capacity', async () => {
            const armorItem = await factory.createItem({
                type: 'armor',
                system: {
                    armor: {
                        base: 6,
                        value: 6,
                        immunities: {
                            base: ['fire'],
                        },
                    },
                    capacity: {
                        total: 8,
                        used: 0
                    }
                }
            });

            const mods: SR5Item<'modification'>[] = [];
            mods.push(await factory.createItem({
                name: 'modA',
                type: 'modification',
                system: {
                    type: 'armor',
                    mod_armor: {
                        value: 2,
                        elements: { fire: 3, cold: 1 },
                        immunities: ['pollutant', 'fire'],
                    },
                    slots: 2,
                }
            }));
            mods.push(await factory.createItem({
                name: 'modB',
                type: 'modification',
                system: {
                    type: 'armor',
                    mod_armor: {
                        value: 1,
                        elements: { fire: 1, radiation: 2 },
                        immunities: ['radiation'],
                    },
                    slots: 1,
                }
            }));

            ArmorPrep.prepareData(armorItem, mods);

            assert.strictEqual(armorItem.system.armor.value, 9);
            assert.strictEqual(armorItem.system.capacity.used, 3);
            assert.strictEqual(armorItem.system.armor.elements.fire.value, 4);
            assert.strictEqual(armorItem.system.armor.elements.cold.value, 1);
            assert.strictEqual(armorItem.system.armor.elements.radiation.value, 2);
            assert.deepEqual([...armorItem.system.armor.immunities.value].sort(), ['fire', 'pollutant', 'radiation']);
        });

        it('does not double armor modification value when armor base is zero across repeated preparation', async () => {
            const armorItem = await factory.createItem({
                type: 'armor',
                system: {
                    armor: {
                        base: 0,
                        value: 0,
                    },
                    capacity: {
                        total: 6,
                        used: 0
                    }
                }
            });

            const mods: SR5Item<'modification'>[] = [];
            mods.push(await factory.createItem({
                name: 'modA',
                type: 'modification',
                system: {
                    type: 'armor',
                    mod_armor: { value: 3 },
                    slots: 1,
                }
            }));

            ArmorPrep.prepareData(armorItem, mods);
            assert.strictEqual(armorItem.system.armor.value, 3);

            ArmorPrep.prepareData(armorItem, mods);
            assert.strictEqual(armorItem.system.armor.value, 3);
        });

        it('splits normal and hardened armor values based on hardened mod flag', async () => {
            const armorItem = await factory.createItem({
                type: 'armor',
                system: {
                    armor: {
                        base: 6,
                        is_hardened: true,
                    },
                }
            });

            const mods: SR5Item<'modification'>[] = [];
            mods.push(await factory.createItem({
                name: 'normalArmorMod',
                type: 'modification',
                system: {
                    type: 'armor',
                    mod_armor: { value: 2, is_hardened: false },
                }
            }));
            mods.push(await factory.createItem({
                name: 'hardenedArmorMod',
                type: 'modification',
                system: {
                    type: 'armor',
                    mod_armor: { value: 3, is_hardened: true },
                }
            }));

            ArmorPrep.prepareData(armorItem, mods);
            assert.strictEqual(armorItem.system.armor.value, 2);
            assert.strictEqual(armorItem.system.armor.hardened, 9);

            armorItem.system.armor.is_hardened = false;
            ArmorPrep.prepareData(armorItem, mods);
            assert.strictEqual(armorItem.system.armor.value, 8);
            assert.strictEqual(armorItem.system.armor.hardened, 3);
        });
    });
}
