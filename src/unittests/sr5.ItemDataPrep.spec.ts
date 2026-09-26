import { SR5TestFactory } from "./utils";
import { SR5Item } from "../module/item/SR5Item";
import { QuenchBatchContext } from "@ethaks/fvtt-quench";
import { RangePrep } from "../module/item/prep/functions/RangePrep";
import { ActionPrep } from "../module/item/prep/functions/ActionPrep";
import { TechnologyPrep } from "../module/item/prep/functions/TechnologyPrep";
import { ArmorPrep } from "../module/item/prep/functions/ArmorPrep";
import { ModifiableValue } from "../module/mods/ModifiableValue";
import { Version0_38_0 } from "../module/migrator/versions/Version0_38_0";
import { ChummerFormulaParser } from '../module/apps/itemImport/helper/ChummerFormula';
import { Parser } from '../module/apps/itemImport/parser/Parser';
import { WeaponModParser } from '../module/apps/itemImport/parser/mod/WeaponModParser';
import { VehicleModParser } from '../module/apps/itemImport/parser/mod/VehicleModParser';
import { DynamicValueEvaluator } from '../module/effect/DynamicValueEvaluator';
import { BonusHelper } from '../module/apps/itemImport/helper/BonusHelper';
import type { BonusSchema } from '../module/apps/itemImport/schema/BonusSchema';
import type { DocCreateData } from '../module/apps/itemImport/helper/BonusConstant';
import { ItemAvailabilityFlow } from '../module/item/flows/ItemAvailabilityFlow';
import { SR5ActiveEffect } from '../module/effect/SR5ActiveEffect';

/**
 * Tests involving data preparation for SR5Item types.
 */
export const shadowrunSR5ItemDataPrep = (context: QuenchBatchContext) => {
    const factory = new SR5TestFactory();
    const { describe, it, after } = context;
    const assert: Chai.AssertStatic = context.assert;

    after(async () => { await factory.destroy(); });

    describe('Chummer formula import', () => {
        it('imports fixed cost and mixed availability as rating-dependent item effects', async () => {
            class DeviceParser extends Parser<'device'> {
                protected readonly parseType = 'device';
                protected async getFolder() { return { id: null } as unknown as Folder; }
            }
            const source = await new DeviceParser().Parse({
                id: { _TEXT: 'e13eb55b-e957-426a-85ba-1943a936bdf9' },
                name: { _TEXT: 'Rating lookup' },
                rating: { _TEXT: '3' },
                cost: { _TEXT: 'FixedValues(39000,149000,217000)' },
                avail: { _TEXT: 'FixedValues(8R,12R,20F)' },
                wirelessbonus: {
                    specificskill: { name: { _TEXT: 'Pistols' }, bonus: { _TEXT: '2' } },
                },
            } as never, 'Gear') as Item.CreateData;
            assert.isTrue((source.effects as ActiveEffect.CreateData[]).some(effect => effect.system?.onlyForWireless));
            const { folder: _folder, ...itemData } = source;
            const device = await factory.createItem({ ...itemData, type: 'device' });

            assert.strictEqual(device.system.technology.cost.value, 39000);
            assert.strictEqual(device.system.technology.availability.label, '8R');
            await device.update({ system: { technology: { rating: 2 } } });
            device.prepareData();
            assert.strictEqual(device.system.technology.cost.value, 149000);
            assert.strictEqual(device.system.technology.availability.label, '12R');
            await device.update({ system: { technology: { rating: 3 } } });
            device.prepareData();
            assert.strictEqual(device.system.technology.availability.label, '20F');
            device.prepareData();
            assert.strictEqual(device.system.technology.cost.value, 217000);

            const wireless = device.effects.find(effect => effect.system.onlyForWireless)!;
            assert.isTrue(wireless.isSuppressed);
            await device.update({ system: { technology: { wireless: 'online' } } });
            assert.isFalse(wireless.isSuppressed);
        });

        it('translates arithmetic and Chummer boolean casts without accepting parent references', () => {
            const formula = ChummerFormulaParser.parse('4000 * Rating - 2000 * number(Rating > 1)');
            assert.exists(formula);
            assert.strictEqual(DynamicValueEvaluator.evaluate(formula!.value, path =>
                path === 'system.technology.rating' ? 2 : undefined), 6000);
            assert.isNull(ChummerFormulaParser.parse('Weapon Cost * Rating'));
            assert.isNull(ChummerFormulaParser.parse('Rating * Body'));
            assert.isFalse(ItemAvailabilityFlow.parseAvailability('12R or Gear').isValid);
            const slots = ChummerFormulaParser.parse('FixedValues(4,8)')!;
            assert.strictEqual(DynamicValueEvaluator.evaluate(slots.value, path =>
                path === 'system.technology.rating' ? 3 : undefined), 8);
        });

        it('separates own capacity, parent capacity and parent-relative values', async () => {
            assert.deepEqual(ChummerFormulaParser.splitCapacity('8/[6]'), { own: '8', used: '6' });
            assert.deepEqual(ChummerFormulaParser.splitCapacity('Rating/[1]'), { own: 'Rating', used: '1' });
            assert.deepEqual(ChummerFormulaParser.splitCapacity('[-Rating]'), { used: '-Rating' });
            assert.deepEqual(ChummerFormulaParser.splitCapacity('4'), { own: '4' });
            assert.isTrue(ChummerFormulaParser.isRelative('+(Rating * 2)'));
            assert.isTrue(ChummerFormulaParser.isRelative('[-Rating]'));
            assert.isFalse(ChummerFormulaParser.isRelative('Rating * 2'));
            assert.strictEqual(ChummerFormulaParser.firstAlternative('12R or Gear'), '12R');
            assert.strictEqual(ChummerFormulaParser.variableMinimum('Variable(50-500)'), 50);
            assert.strictEqual(ChummerFormulaParser.classify('20000 + (99 * Gear Cost)'), 'requires child item');
            assert.strictEqual(ChummerFormulaParser.classify('Parent Cost * 5'), 'requires parent item');
            assert.strictEqual(ChummerFormulaParser.classify('1000 + 4000*number(Body >= 4)'), 'requires vehicle stats');
            assert.strictEqual(ChummerFormulaParser.classify('(Rating - MinRating + 1) * 5000'), 'requires metatype minimum');
            assert.strictEqual(ChummerFormulaParser.classify('[*]'), 'wildcard');

            assert.isNull(ChummerFormulaParser.parse('Slots * 100'));
            const slotCost = ChummerFormulaParser.parse('Slots * 100', { identifiers: { Slots: '@system.slots' } })!;
            assert.strictEqual(DynamicValueEvaluator.evaluate(slotCost.value, path =>
                path === 'system.slots' ? 3 : undefined), 300);

            class DeviceParser extends Parser<'device'> {
                protected readonly parseType = 'device';
                protected async getFolder() { return { id: null } as unknown as Folder; }
            }
            const parse = async (data: Record<string, string>) => {
                const source = await new DeviceParser().Parse({
                    id: { _TEXT: 'e13eb55b-e957-426a-85ba-1943a936bdf9' },
                    name: { _TEXT: 'Chummer device' },
                    ...Object.fromEntries(Object.entries(data).map(([key, _TEXT]) => [key, { _TEXT }])),
                } as never, 'Gear') as Item.CreateData;
                const effects = (source.effects ?? []) as { system?: { changes?: { key: string }[] } }[];
                return {
                    technology: (source.system as Item.SystemOfType<'device'>).technology,
                    changes: effects.flatMap(effect => effect.system?.changes ?? []).map(change => change.key),
                };
            };

            const relative = await parse({ rating: '6', avail: '+(Rating *2)', cost: 'Rating * 100' });
            assert.notInclude(relative.changes, 'system.technology.availability');
            assert.include(relative.changes, 'system.technology.cost');
            assert.strictEqual(relative.technology.availability.label, '+(Rating *2)');

            const alternative = await parse({ avail: '12R or Gear', cost: 'Variable(50-500)' });
            assert.strictEqual(alternative.technology.availability.base, 12);
            assert.strictEqual(alternative.technology.availability.restriction, 'restricted');
            assert.strictEqual(alternative.technology.cost.base, 50);

            const fromCharacter = await parse({ rating: '{STRMaximum}' });
            assert.strictEqual(fromCharacter.technology.rating, 1);
            assert.strictEqual(fromCharacter.technology.max_rating, 0);
        });

        it('calculates ware essence and capacity after item formula effects', async () => {
            const essence = ChummerFormulaParser.parse('Rating * 0.1')!;
            const capacity = ChummerFormulaParser.parse('Rating * 4')!;
            const ware = await factory.createItem({
                type: 'cyberware',
                system: {
                    grade: 'alpha', capacity: { total: 0 },
                    technology: { rating: 2, availability: { base: 0, restriction: 'restricted' } },
                },
                effects: [{
                    name: 'Chummer formulas',
                    system: {
                        targets: [{ id: 'item', applyTo: 'item' }],
                        changes: [
                            { key: 'system.technology.essence', value: essence.value, type: 'override', priority: ModifiableValue.Priority.RATING, target: 'item' },
                            { key: 'system.capacity.total', value: capacity.value, type: 'override', target: 'item' },
                            { key: 'system.technology.cost', value: '@system.technology.rating * 1000', type: 'override', priority: ModifiableValue.Priority.RATING, target: 'item' },
                            { key: 'system.technology.availability', value: '@system.technology.rating * 3', type: 'override', priority: ModifiableValue.Priority.RATING, target: 'item' },
                        ],
                    },
                }],
            });
            ware.prepareData();
            assert.closeTo(ware.system.technology.essence.value, 0.16, 0.00001);
            assert.strictEqual(ware.system.capacity.total, 8);
            assert.strictEqual(ware.system.technology.cost.value, 2400);
            assert.strictEqual(ware.system.technology.availability.label, '8R');
            await ware.update({ system: { technology: { rating: 3 } } });
            ware.prepareData();
            assert.closeTo(ware.system.technology.essence.value, 0.24, 0.00001);
            assert.strictEqual(ware.system.capacity.total, 12);
            assert.strictEqual(ware.system.technology.cost.value, 3600);
            assert.strictEqual(ware.system.technology.availability.label, '11R');
            await ware.update({ system: { grade: 'standard' } });
            ware.prepareData();
            assert.closeTo(ware.system.technology.essence.value, 0.3, 0.00001);
            assert.strictEqual(ware.system.technology.cost.value, 3000);
            assert.strictEqual(ware.system.technology.availability.label, '9R');
        });

        it('imports supported wireless and reputation bonuses as effects', () => {
            const wireless = { name: 'Wireless gear', system: { technology: { rating: 1 } }, effects: [] } as unknown as DocCreateData;
            BonusHelper.addBonus(wireless, {
                specificskill: { name: { _TEXT: 'Pistols' }, bonus: { _TEXT: '2' } },
            } as BonusSchema, { onlyForWireless: true });
            assert.isTrue(wireless.effects![0].system.onlyForWireless);

            const quality = { name: 'Blandness', system: {}, effects: [] } as unknown as DocCreateData;
            BonusHelper.addBonus(quality, {
                notoriety: { _TEXT: '-1' }, publicawareness: { _TEXT: '-2' },
            } as BonusSchema);
            assert.deepEqual(quality.effects!.map(effect => effect.system.changes[0].key),
                ['system.notoriety', 'system.public_awareness']);
        });
    });

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

        it('recalculates concealment after applying an item effect', async () => {
            const device = await factory.createItem({
                type: 'device',
                system: { technology: { conceal: { base: 2, value: 2 } } },
            });
            const [effect] = await device.createEmbeddedDocuments('ActiveEffect', [{
                name: 'Concealment Modifier',
                system: {
                    targets: [{ id: 'item', applyTo: 'item' }],
                    changes: [{ key: 'system.technology.conceal', value: '3', type: 'add', target: 'item' }],
                },
            }]);

            device.prepareData();
            assert.strictEqual(device.system.technology.conceal.value, 5);
            device.prepareData();
            assert.strictEqual(device.system.technology.conceal.value, 5);
            await effect.update({ disabled: true });
            device.prepareData();
            assert.strictEqual(device.system.technology.conceal.value, 2);
        });

        it('recalculates weapon damage, AP, limit, and recoil after item effects', async () => {
            const weapon = await factory.createItem({
                type: 'weapon',
                system: {
                    category: 'range',
                    action: {
                        damage: { base: 4, ap: { base: -1 } },
                        limit: { base: 5 },
                    },
                    range: { rc: { base: 2 } },
                },
            });
            await weapon.createEmbeddedDocuments('ActiveEffect', [{
                name: 'Weapon modifier',
                system: {
                    targets: [{ id: 'item', applyTo: 'item' }],
                    changes: [
                        { key: 'system.action.damage', value: '2', type: 'add', target: 'item' },
                        { key: 'system.action.damage.ap', value: '-1', type: 'add', target: 'item' },
                        { key: 'system.action.limit', value: '1', type: 'add', target: 'item' },
                        { key: 'system.range.rc', value: '3', type: 'add', target: 'item' },
                    ],
                },
            }]);

            weapon.prepareData();
            assert.strictEqual(weapon.system.action.damage.value, 6);
            assert.strictEqual(weapon.system.action.damage.ap.value, -2);
            assert.strictEqual(weapon.system.action.limit.value, 6);
            assert.strictEqual(weapon.system.range.rc.value, 5);
        });

        it('applies rating before ware grade and user cost modifiers', async () => {
            const ware = await factory.createItem({
                type: 'cyberware',
                system: { grade: 'alpha', technology: { rating: 4, cost: { base: 100, value: 100 }, availability: { base: 3, restriction: 'restricted' } } },
            });
            await ware.createEmbeddedDocuments('ActiveEffect', [{
                name: 'Rating multiplier',
                system: {
                    targets: [{ id: 'item', applyTo: 'item' }],
                    changes: [
                        { key: 'system.technology.cost', value: '@system.technology.rating', type: 'multiply', priority: ModifiableValue.Priority.RATING, target: 'item' },
                        { key: 'system.technology.availability', value: '@system.technology.rating', type: 'multiply', priority: ModifiableValue.Priority.RATING, target: 'item' },
                    ],
                },
            }]);
            ware.prepareData();

            assert.strictEqual(ware.system.technology.cost.value, 100 * 4 * 1.2);
            assert.strictEqual(ware.system.technology.availability.value, 3 * 4 + 2);
            await ware.update({ system: { technology: { rating: 0 } } });
            ware.prepareData();
            assert.strictEqual(ware.system.technology.cost.value, 0);
            assert.strictEqual(ware.system.technology.availability.value, 2);
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

        it('parent-item active effects on equipped nested items apply to the parent item', async () => {
            const actor = await factory.createActor({ type: 'character' });
            const [weapon] = await actor.createEmbeddedDocuments('Item', [{
                type: 'weapon',
                name: 'Parent Weapon',
                system: { technology: { cost: { base: 500, value: 500 } } },
            }]) as SR5Item<'weapon'>[];

            await weapon.createNestedItem({
                type: 'modification',
                name: 'Nested Mod',
                system: { technology: { rating: 2, equipped: true, cost: { base: 100, value: 100 } } },
                effects: [{
                    name: 'Parent Cost Modifier',
                    system: {
                        targets: [{ id: 'parent', applyTo: 'parent_item' }],
                        changes: [
                            { key: 'system.technology.cost', value: '@system.technology.rating * 100', type: 'add', target: 'parent' },
                        ],
                    },
                }],
            } as Item.Source);

            actor.prepareData();
            actor.prepareData();

            const nested = weapon.items[0] as SR5Item<'modification'>;
            assert.strictEqual(weapon.system.technology.cost.value, 700);
            assert.strictEqual(nested.system.technology.cost.value, 100);

            await weapon.updateNestedItems({ _id: nested.id, system: { technology: { equipped: false } } } as Item.UpdateInput);
            actor.prepareData();
            assert.strictEqual(weapon.system.technology.cost.value, 500);
        });

        it('resolves @actor, @parent and @affected references for nested items', async () => {
            const actor = await factory.createActor({ type: 'character', system: { attributes: { body: { base: 5 } } } });
            const [weapon] = await actor.createEmbeddedDocuments('Item', [{
                type: 'weapon',
                name: 'Parent Weapon',
                system: { technology: { cost: { base: 500, value: 500 } } },
            }]) as SR5Item<'weapon'>[];

            await weapon.createNestedItem({
                type: 'modification',
                name: 'Nested Mod',
                system: { technology: { equipped: true, cost: { base: 100, value: 100 } } },
                effects: [{
                    name: 'References',
                    system: {
                        targets: [{ id: 'item', applyTo: 'item' }, { id: 'parent', applyTo: 'parent_item' }],
                        changes: [
                            { key: 'system.technology.cost', value: '@parent.system.technology.cost.base * 0.5 + @actor.system.attributes.body.base', type: 'add', target: 'item' },
                            { key: 'system.technology.cost', value: '@affected.system.technology.cost.base * 0.1', type: 'add', target: 'parent' },
                        ],
                    },
                }],
            } as Item.Source);
            actor.prepareData();

            const nested = weapon.items[0] as SR5Item<'modification'>;
            // 100 + half the weapon's 500 base + body 5.
            assert.strictEqual(nested.system.technology.cost.value, 355);
            // 500 + 10% of its own base, added by the nested mod.
            assert.strictEqual(weapon.system.technology.cost.value, 550);

            const standalone = await factory.createItem({
                type: 'modification',
                system: { technology: { cost: { base: 100, value: 100 } } },
                effects: [{
                    name: 'Missing Parent',
                    system: {
                        targets: [{ id: 'item', applyTo: 'item' }],
                        changes: [{ key: 'system.technology.cost', value: '(@parent.system.technology.cost.base ?? 0) + 1', type: 'add', target: 'item' }],
                    },
                }],
            });
            standalone.prepareData();
            assert.strictEqual(standalone.system.technology.cost.value, 101);
        });

        it('resolves @effect references to the effect rating', async () => {
            const actor = await factory.createActor({ type: 'character', system: { attributes: { body: { base: 3 } } } });
            const [item] = await actor.createEmbeddedDocuments('Item', [{
                type: 'equipment',
                name: 'Rated Gear',
                system: { technology: { cost: { base: 100, value: 100 } } },
                effects: [{
                    name: 'Rating 4',
                    system: {
                        rating: 4,
                        targets: [{ id: 'item', applyTo: 'item' }, { id: 'actor', applyTo: 'actor' }],
                        changes: [
                            { key: 'system.technology.cost', value: '@effect.system.rating * 50', type: 'add', target: 'item' },
                            { key: 'system.attributes.body', value: '@effect.system.rating', type: 'add', target: 'actor' },
                        ],
                    },
                }],
            }]) as SR5Item<'equipment'>[];
            actor.prepareData();

            assert.strictEqual(item.system.technology.cost.value, 300);
            assert.strictEqual(actor.system.attributes.body.value, 7);
        });

        it('resolves @driver references to the vehicle driver', async () => {
            const driver = await factory.createActor({ type: 'character', system: { attributes: { body: { base: 4 } } } });
            const vehicle = await factory.createActor({ type: 'vehicle' });
            const [item] = await vehicle.createEmbeddedDocuments('Item', [{
                type: 'equipment',
                name: 'Driver Gear',
                system: { technology: { cost: { base: 100, value: 100 } } },
                effects: [{
                    name: 'Driver Body',
                    system: {
                        targets: [{ id: 'item', applyTo: 'item' }],
                        changes: [{ key: 'system.technology.cost', value: '(@driver.system.attributes.body.base ?? 0) * 100', type: 'add', target: 'item' }],
                    },
                }],
            }]) as SR5Item<'equipment'>[];

            vehicle.prepareData();
            assert.strictEqual(item.system.technology.cost.value, 100);

            await vehicle.addVehicleDriver(driver.uuid);
            vehicle.prepareData();
            assert.strictEqual(item.system.technology.cost.value, 500);
        });

        it('resolves @summoner and @technomancer references', async () => {
            const character = await factory.createActor({ type: 'character', system: { attributes: { magic: { base: 6 }, resonance: { base: 5 } } } });
            const spirit = await factory.createActor({ type: 'spirit' });
            const sprite = await factory.createActor({ type: 'sprite' });

            assert.isUndefined(SR5ActiveEffect.referenceResolver(spirit)('summoner.system.attributes.magic.base'));

            await spirit.addSummoner(character);
            await sprite.addTechnomancer(character);

            assert.strictEqual(SR5ActiveEffect.referenceResolver(spirit)('summoner.system.attributes.magic.base'), 6);
            assert.strictEqual(SR5ActiveEffect.referenceResolver(sprite)('technomancer.system.attributes.resonance.base'), 5);
            // Each reference only resolves on its own actor type.
            assert.isUndefined(SR5ActiveEffect.referenceResolver(sprite)('summoner.system.attributes.magic.base'));
        });

        it('imports parent and vehicle references and parent-relative availability', async () => {
            class TestWeaponModParser extends WeaponModParser {
                protected override async getFolder() { return { id: null } as unknown as Folder; }
            }
            class TestVehicleModParser extends VehicleModParser {
                protected override async getFolder() { return { id: null } as unknown as Folder; }
            }
            const data = (fields: Record<string, string>) => ({
                id: { _TEXT: 'e13eb55b-e957-426a-85ba-1943a936bdf9' },
                name: { _TEXT: 'Chummer mod' },
                ...Object.fromEntries(Object.entries(fields).map(([key, _TEXT]) => [key, { _TEXT }])),
            }) as never;
            const changes = (source: Item.CreateData) => ((source.effects ?? []) as { system?: { changes?: { key: string; value: string; target: string }[] } }[])
                .flatMap(effect => effect.system?.changes ?? []);

            const accessory = await new TestWeaponModParser().Parse(data({ rating: '2', cost: 'Weapon Cost * Rating', avail: '+2R' }), 'Weapon_Mod') as Item.CreateData;
            const cost = changes(accessory).find(change => change.key === 'system.technology.cost')!;
            assert.include(cost.value, '@parent.system.technology.cost.base');
            const parentAvail = changes(accessory).find(change => change.key === 'system.technology.availability')!;
            assert.strictEqual(parentAvail.target, 'parent');

            const vehicleMod = await new TestVehicleModParser().Parse(
                data({ category: 'Body', slots: '1', cost: 'number(Body = 0) * 500 + Body * 1000' }), 'Vehicle_Mod') as Item.CreateData;
            const vehicleCost = changes(vehicleMod).find(change => change.key === 'system.technology.cost')!;
            assert.include(vehicleCost.value, '@actor.system.attributes.body.base');

            // The +2R accessory raises its weapon's availability by 2 and makes it restricted.
            const actor = await factory.createActor({ type: 'character' });
            const [weapon] = await actor.createEmbeddedDocuments('Item', [{
                type: 'weapon',
                name: 'Parent Weapon',
                system: { technology: { availability: { base: 4, value: 4, restriction: 'none' } } },
            }]) as SR5Item<'weapon'>[];
            const { folder: _folder, ...accessoryData } = accessory;
            foundry.utils.setProperty(accessoryData, 'system.technology.equipped', true);
            await weapon.createNestedItem(accessoryData as Item.Source);
            actor.prepareData();
            assert.strictEqual(weapon.system.technology.availability.label, '6R');

            // Built in, the same accessory is already part of the weapon's cost and availability.
            const builtIn = foundry.utils.deepClone(accessoryData) as unknown as Item.Source;
            Parser.includeInParent(builtIn);
            assert.strictEqual((builtIn.system as SR5Item<'modification'>['system']).technology.cost.base, 0);
            assert.isFalse(changes(builtIn).some(change => change.target === 'parent' || change.key === 'system.technology.cost'));

            const [includedWeapon] = await actor.createEmbeddedDocuments('Item', [{
                type: 'weapon',
                name: 'Weapon With Built-in Accessory',
                system: { technology: { availability: { base: 4, value: 4, restriction: 'none' } } },
            }]) as SR5Item<'weapon'>[];
            await includedWeapon.createNestedItem(builtIn);
            actor.prepareData();
            assert.strictEqual(includedWeapon.system.technology.availability.label, '4');
        });

        it('drops capacity, cost and parent changes from included armor and vehicle mods', () => {
            const mod = () => ({
                type: 'modification',
                name: 'Included Mod',
                system: { slots: 2, technology: { cost: { base: 500, value: 500 } } },
                effects: [{
                    name: 'Mod Effects',
                    system: {
                        targets: [{ id: 'item', applyTo: 'item' }, { id: 'actor', applyTo: 'actor' }],
                        changes: [
                            { key: 'system.slots', value: '@system.technology.rating', type: 'override', target: 'item' },
                            { key: 'system.technology.conceal', value: '1', type: 'add', target: 'item' },
                            { key: 'system.vehicle_stats.handling', value: '1', type: 'add', target: 'actor' },
                        ],
                    },
                }],
            }) as unknown as Item.Source;
            const keys = (item: Item.Source) => (item.effects as { system: { changes: { key: string }[] } }[])
                .flatMap(effect => effect.system.changes.map(change => change.key));
            const system = (item: Item.Source) => item.system as SR5Item<'modification'>['system'];

            // An armor's capacity leaves out its included mods, whose own bonuses still count.
            const armorMod = mod();
            Parser.includeInParent(armorMod);
            assert.strictEqual(system(armorMod).slots, 0);
            assert.strictEqual(system(armorMod).technology.cost.base, 0);
            assert.deepEqual(keys(armorMod), ['system.technology.conceal', 'system.vehicle_stats.handling']);

            // A vehicle's own stats already include its mods' bonuses.
            const vehicleMod = mod();
            Parser.includeInParent(vehicleMod, { parentStats: true });
            assert.deepEqual(keys(vehicleMod), ['system.technology.conceal']);

            // An added mod keeps its own cost and slots, but not a change its parent's stats already hold.
            const addedMod = mod();
            Parser.dropChanges(addedMod, ['actor']);
            assert.strictEqual(system(addedMod).slots, 2);
            assert.deepEqual(keys(addedMod), ['system.slots', 'system.technology.conceal']);
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

        it('keeps unparseable migrated availability until its structured fields change', async () => {
            const legacy: any = {
                type: 'device',
                system: { technology: { cost: 100, availability: '(Rating * 3)R' } },
            };
            new Version0_38_0().migrateItem(legacy);
            assert.strictEqual(legacy.system.technology.availability.label, '(Rating * 3)R');

            const device = await factory.createItem<'device'>(legacy);
            assert.strictEqual(device.system.technology.availability.label, '(Rating * 3)R');
            device.prepareData();
            device.prepareData();
            assert.strictEqual(device.system.technology.availability.value, 0);
            assert.strictEqual(device.system.technology.availability.label, '(Rating * 3)R');

            await device.update({ system: { technology: { availability: { base: 3 } } } });
            assert.strictEqual(device.system.technology.availability.label, '3');

            const restricted = await factory.createItem({
                type: 'device',
                system: { technology: { availability: legacy.system.technology.availability } },
            });
            await restricted.update({ system: { technology: { availability: { restriction: 'restricted' } } } });
            assert.strictEqual(restricted.system.technology.availability.label, '0R');
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

        it('keeps ware grade essence, cost and availability adjustments', async () => {
            const ware = await factory.createItem({
                type: 'cyberware',
                system: {
                    grade: 'alpha',
                    technology: {
                        essence: { base: 1 },
                        availability: { base: 6, restriction: 'restricted', label: '6R' },
                        cost: { base: 100, value: 100 },
                    },
                },
            });
            ware.prepareData();

            assert.strictEqual(ware.system.technology.availability.value, 8);
            assert.strictEqual(ware.system.technology.availability.label, '8R');
            assert.strictEqual(ware.system.technology.cost.value, 120);
            assert.strictEqual(ware.system.technology.essence.value, 0.8);
        });

        it('loads migrated rating effects on an unequipped item', async () => {
            // A 0.37.0 item, where cost was a number, availability a string and both were multiplied by rating.
            const legacy: any = {
                type: 'device',
                system: {
                    technology: {
                        rating: 4,
                        equipped: false,
                        cost: 100,
                        availability: '3R',
                        calculated: {
                            cost: { value: 400, adjusted: true },
                            availability: { value: '12R', adjusted: true },
                        },
                    },
                },
            };
            new Version0_38_0().migrateItem(legacy);

            const device = await factory.createItem<'device'>(legacy);
            device.prepareData();

            // The effects the migration wrote apply to the stored item, even while it is unequipped.
            assert.strictEqual(device.system.technology.cost.value, 400);
            assert.strictEqual(device.system.technology.availability.value, 12);
            assert.strictEqual(device.system.technology.availability.label, '12R');
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
