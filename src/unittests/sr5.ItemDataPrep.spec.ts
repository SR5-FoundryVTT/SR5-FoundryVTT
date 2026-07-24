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

        it('applies item-target active effects to technology conceal out-of-place', async () => {
            const device = await factory.createItem({
                type: 'device',
                system: { technology: { conceal: { base: 4, value: 4 } } },
            });

            await device.createEmbeddedDocuments('ActiveEffect', [{
                name: 'Conceal Modifier',
                system: {
                    targets: [{ id: 'item', applyTo: 'item' }],
                    changes: [
                        { key: 'system.technology.conceal', value: '3', type: 'add', target: 'item' },
                    ],
                },
            }]);

            device.prepareData();
            device.prepareData();

            assert.strictEqual(device.system.technology.conceal.value, 7);
        });

        it('applies item-target active effects to technology cost', async () => {
            const device = await factory.createItem({
                type: 'device',
                system: { technology: { cost: { base: 100, value: 100 } } },
            });

            await device.createEmbeddedDocuments('ActiveEffect', [{
                name: 'Cost Modifier',
                system: {
                    targets: [{ id: 'item', applyTo: 'item' }],
                    changes: [
                        { key: 'system.technology.cost', value: '50', type: 'add', target: 'item' },
                    ],
                },
            }]);
            device.prepareData();

            assert.strictEqual(device.system.technology.cost.value, 150);
        });

        it('applies item-target active effects to technology cost out-of-place (idempotent, logged)', async () => {
            const device = await factory.createItem({
                type: 'device',
                system: { technology: { cost: { base: 100, value: 100 } } },
            });

            const [effect] = await device.createEmbeddedDocuments('ActiveEffect', [{
                name: 'Cost Modifier',
                system: {
                    targets: [{ id: 'item', applyTo: 'item' }],
                    changes: [
                        { key: 'system.technology.cost', value: '50', type: 'add', target: 'item' },
                    ],
                },
            }]);

            // Repeated preparation must not re-fold the native effect onto the value (items are not reset
            // between prepare cycles, so a prior display entry could otherwise double the applied delta).
            device.prepareData();
            device.prepareData();
            device.prepareData();
            assert.strictEqual(device.system.technology.cost.value, 150);

            // The native delta lands on `.value`; `changes[]` holds only a single descriptive display entry
            // (the tooltip log), sourced from the effect, not a folded system part.
            const logged = device.system.technology.cost.changes.filter(change => change.source === effect.uuid);
            assert.strictEqual(logged.length, 1);
            assert.strictEqual(logged[0].name, 'Cost Modifier');
            assert.strictEqual(logged[0].value, 50);
        });

        it('applies item-target active effect multipliers to technology cost', async () => {
            const device = await factory.createItem({
                type: 'device',
                system: { technology: { cost: { base: 100, value: 100 } } },
            });

            await device.createEmbeddedDocuments('ActiveEffect', [{
                name: 'Cost Multiplier',
                system: {
                    targets: [{ id: 'item', applyTo: 'item' }],
                    changes: [
                        { key: 'system.technology.cost', value: '2', type: 'multiply', target: 'item' },
                    ],
                },
            }]);
            device.prepareData();

            assert.strictEqual(device.system.technology.cost.value, 200);
        });

        it('applies item-target active effect overrides to technology cost', async () => {
            const device = await factory.createItem({
                type: 'device',
                system: { technology: { cost: { base: 100, value: 100 } } },
            });

            await device.createEmbeddedDocuments('ActiveEffect', [{
                name: 'Cost Override',
                system: {
                    targets: [{ id: 'item', applyTo: 'item' }],
                    changes: [
                        { key: 'system.technology.cost', value: '500', type: 'override', target: 'item' },
                    ],
                },
            }]);
            device.prepareData();

            assert.strictEqual(device.system.technology.cost.value, 500);
        });

        it('item-target active effects apply only to their parent item', async () => {
            const actor = await factory.createActor({ type: 'character' });
            const items = await actor.createEmbeddedDocuments('Item', [
                { type: 'device', name: 'Modified Device', system: { technology: { cost: { base: 100, value: 100 } } } },
                { type: 'device', name: 'Plain Device', system: { technology: { cost: { base: 100, value: 100 } } } },
            ]);
            const modified = items[0] as SR5Item<'device'>;
            const plain = items[1] as SR5Item<'device'>;

            await modified.createEmbeddedDocuments('ActiveEffect', [{
                name: 'Cost Modifier',
                system: {
                    targets: [{ id: 'item', applyTo: 'item' }],
                    changes: [
                        { key: 'system.technology.cost', value: '50', type: 'add', target: 'item' },
                    ],
                },
            }]);
            actor.prepareData();

            assert.strictEqual(modified.system.technology.cost.value, 150);
            assert.strictEqual(plain.system.technology.cost.value, 100);
        });

        it('item-target active effects on nested items apply only to the nested item', async () => {
            const actor = await factory.createActor({ type: 'character' });
            const [weapon] = await actor.createEmbeddedDocuments('Item', [{
                type: 'weapon',
                name: 'Parent Weapon',
                system: { technology: { cost: { base: 500, value: 500 } } },
            }]) as SR5Item<'weapon'>[];

            await weapon.createNestedItem({
                type: 'modification',
                name: 'Nested Mod',
                system: { technology: { cost: { base: 100, value: 100 } } },
                effects: [{
                    name: 'Nested Cost Modifier',
                    system: {
                        targets: [{ id: 'item', applyTo: 'item' }],
                        changes: [
                            { key: 'system.technology.cost', value: '50', type: 'add', target: 'item' },
                        ],
                    },
                }],
            } as Item.Source);

            actor.prepareData();

            const nested = weapon.items[0] as SR5Item<'modification'>;
            assert.exists(nested);
            assert.strictEqual(nested.system.technology.cost.base, 100);
            assert.strictEqual(nested.system.technology.cost.changes.length, 1);
            assert.strictEqual(nested.system.technology.cost.value, 150);
            assert.strictEqual(weapon.system.technology.cost.value, 500);
        });

        it('does not apply actor-target item effects to the item itself', async () => {
            const device = await factory.createItem({
                type: 'device',
                system: { technology: { cost: { base: 100, value: 100 } } },
            });

            await device.createEmbeddedDocuments('ActiveEffect', [{
                name: 'Actor Cost Modifier',
                system: {
                    targets: [{ id: 'actor', applyTo: 'actor' }],
                    changes: [
                        { key: 'system.technology.cost', value: '50', type: 'add', target: 'actor' },
                    ],
                },
            }]);
            device.prepareData();

            assert.strictEqual(device.system.technology.cost.value, 100);
        });

        it('applies item-target active effects to non-technology items', async () => {
            const spell = await factory.createItem({
                type: 'spell',
                system: { description: { source: 'Core Rulebook' } },
            });

            await spell.createEmbeddedDocuments('ActiveEffect', [{
                name: 'Item Source Override',
                system: {
                    targets: [{ id: 'item', applyTo: 'item' }],
                    changes: [
                        { key: 'system.description.source', value: 'Street Grimoire', type: 'override', target: 'item' },
                    ],
                },
            }]);
            spell.prepareData();

            assert.strictEqual(spell.system.description.source, 'Street Grimoire');
        });

        it('applies item-target active effects to availability while preserving suffix', async () => {
            const device = await factory.createItem({
                type: 'device',
                system: { technology: { availability: { base: 6, restriction: 'restricted', label: '6R' } } },
            });

            await device.createEmbeddedDocuments('ActiveEffect', [{
                name: 'Availability Modifier',
                system: {
                    targets: [{ id: 'item', applyTo: 'item' }],
                    changes: [
                        { key: 'system.technology.availability', value: '2', type: 'add', target: 'item' },
                    ],
                },
            }]);
            device.prepareData();

            assert.strictEqual(device.system.technology.availability.value, 8);
            assert.strictEqual(device.system.technology.availability.label, '8R');
        });

        it('applies item-target active effect overrides to availability number only', async () => {
            const device = await factory.createItem({
                type: 'device',
                system: { technology: { availability: { base: 6, restriction: 'restricted', label: '6R' } } },
            });

            await device.createEmbeddedDocuments('ActiveEffect', [{
                name: 'Availability Number Override',
                system: {
                    targets: [{ id: 'item', applyTo: 'item' }],
                    changes: [
                        { key: 'system.technology.availability', value: '12', type: 'override', target: 'item' },
                    ],
                },
            }]);
            device.prepareData();

            assert.strictEqual(device.system.technology.availability.value, 12);
            assert.strictEqual(device.system.technology.availability.label, '12R');
        });

        it('applies item-target active effect overrides to availability restriction', async () => {
            const device = await factory.createItem({
                type: 'device',
                system: { technology: { availability: { base: 12, restriction: 'restricted', label: '12R' } } },
            });

            await device.createEmbeddedDocuments('ActiveEffect', [{
                name: 'Availability Restriction Override',
                system: {
                    targets: [{ id: 'item', applyTo: 'item' }],
                    changes: [
                        { key: 'system.technology.availability.restriction', value: 'forbidden', type: 'override', target: 'item' },
                    ],
                },
            }]);
            device.prepareData();

            assert.strictEqual(device.system.technology.availability.value, 12);
            assert.strictEqual(device.system.technology.availability.restriction, 'forbidden');
            assert.strictEqual(device.system.technology.availability.label, '12F');
        });

        it('does not apply disabled or suppressed item-target active effects', async () => {
            const disabledDevice = await factory.createItem({
                type: 'device',
                system: { technology: { cost: { base: 100, value: 100 } } },
            });
            const unequippedDevice = await factory.createItem({
                type: 'device',
                system: { technology: { cost: { base: 100, value: 100 }, equipped: false } },
            });

            const effectData: any = {
                name: 'Cost Modifier',
                system: {
                    targets: [{ id: 'item', applyTo: 'item' }],
                    changes: [
                        { key: 'system.technology.cost', value: '50', type: 'add', target: 'item' },
                    ],
                },
            };

            await disabledDevice.createEmbeddedDocuments('ActiveEffect', [{ ...effectData, disabled: true }]);
            await unequippedDevice.createEmbeddedDocuments('ActiveEffect', [{
                ...effectData,
                system: { ...effectData.system, onlyForEquipped: true },
            }]);
            disabledDevice.prepareData();
            unequippedDevice.prepareData();

            assert.strictEqual(disabledDevice.system.technology.cost.value, 100);
            assert.strictEqual(unequippedDevice.system.technology.cost.value, 100);
        });

        it('does not compound the device rating attribute across repeated preparation', async () => {
            const device = await factory.createItem({
                type: 'device',
                system: { technology: { rating: 4 } },
            });

            device.prepareData();
            const once = device.system.attributes!.rating.value;
            device.prepareData();
            device.prepareData();

            // `attributes.rating` is not recreated per cycle and item values are never reset, so a
            // non-idempotent part would accumulate the rating on every preparation.
            assert.strictEqual(device.system.attributes!.rating.value, once);
            assert.strictEqual(once, 4);
        });

        it('applies item-target effects to a device matrix attribute', async () => {
            const device = await factory.createItem({
                type: 'device',
                system: { technology: { rating: 3 } },
            });

            await device.createEmbeddedDocuments('ActiveEffect', [{
                name: 'Firewall Boost',
                system: {
                    targets: [{ id: 'item', applyTo: 'item' }],
                    changes: [
                        { key: 'system.attributes.firewall', value: '2', type: 'add', target: 'item' },
                    ],
                },
            }]);

            device.prepareData();
            const once = device.system.attributes!.firewall.value;
            device.prepareData();
            const twice = device.system.attributes!.firewall.value;

            assert.strictEqual(once, twice, 'repeated prepareData must be idempotent');
            // The device rating (3) is the anchor, now a BASE_PRIORITY entry rather than `base`, so the
            // effect's +2 lands on top of it for a value of 5.
            assert.strictEqual(once, 5, 'firewall value after +2 effect');
        });

        it('applies item-target effects to armor item rating out-of-place', async () => {
            const armorItem = await factory.createItem({
                type: 'armor',
                system: { armor: { base: 6, value: 6 } },
            });

            await armorItem.createEmbeddedDocuments('ActiveEffect', [{
                name: 'Armor Boost',
                system: {
                    targets: [{ id: 'item', applyTo: 'item' }],
                    changes: [
                        { key: 'system.armor', value: '2', type: 'add', target: 'item' },
                    ],
                },
            }]);

            armorItem.prepareData();
            const once = armorItem.system.armor.value;
            armorItem.prepareData();
            const twice = armorItem.system.armor.value;

            assert.strictEqual(once, twice, 'repeated prepareData must be idempotent');
            // base is 6; if the effect applies, value is 8.
            assert.strictEqual(once, 8, 'armor value after +2 effect');
        });

        it('keeps ware grade cost and availability adjustments', async () => {
            const ware = await factory.createItem({
                type: 'cyberware',
                system: {
                    grade: 'alpha',
                    essence: 1,
                    technology: {
                        availability: { base: 6, restriction: 'restricted', label: '6R' },
                        cost: { base: 100, value: 100 },
                    },
                },
            });
            ware.prepareData();

            assert.strictEqual(ware.system.technology.availability.value, 8);
            assert.strictEqual(ware.system.technology.availability.label, '8R');
            assert.strictEqual(ware.system.technology.cost.value, 120);
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

        it('applies item-target active effects to action damage and limit out-of-place', async () => {
            const weapon = await factory.createItem({
                type: 'weapon',
                system: { action: { damage: { base: 4, value: 4 }, limit: { base: 5, value: 5 } } },
            });

            await weapon.createEmbeddedDocuments('ActiveEffect', [{
                name: 'Action Modifier',
                system: {
                    targets: [{ id: 'item', applyTo: 'item' }],
                    changes: [
                        { key: 'system.action.damage', value: '2', type: 'add', target: 'item' },
                        { key: 'system.action.limit', value: '1', type: 'add', target: 'item' },
                    ],
                },
            }]);

            weapon.prepareData();
            weapon.prepareData();

            assert.strictEqual(weapon.system.action.damage.value, 6);
            assert.strictEqual(weapon.system.action.limit.value, 6);
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

        it('applies item-target active effects to recoil compensation out-of-place', async () => {
            const weapon = await factory.createItem({ type: 'weapon', system: { category: 'range', range: { rc: { base: 2, value: 2 } } } });

            await weapon.createEmbeddedDocuments('ActiveEffect', [{
                name: 'RC Modifier',
                system: {
                    targets: [{ id: 'item', applyTo: 'item' }],
                    changes: [
                        { key: 'system.range.rc', value: '3', type: 'add', target: 'item' },
                    ],
                },
            }]);

            weapon.prepareData();
            weapon.prepareData();

            assert.strictEqual(weapon.system.range.rc.value, 5);
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
