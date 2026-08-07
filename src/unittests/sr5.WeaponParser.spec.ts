import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { DataDefaults } from '../module/data/DataDefaults';
import { WeaponParserBase } from '../module/apps/itemImport/parser/weapon/WeaponParserBase';
import { WeaponParser as ActorWeaponParser } from '../module/apps/actorImport/itemImporter/weaponImport/WeaponParser';
import { Constants } from '../module/apps/itemImport/importer/Constants';
import { CritterParser } from '../module/apps/itemImport/parser/metatype/CritterParser';
import { AmmoParser as ItemAmmoParser } from '../module/apps/itemImport/parser/gear/AmmoParser';

function mockXmlData(data: Record<string, unknown>): Record<string, unknown> {
    return Object.fromEntries(Object.entries(data)
        .map(([key, value]) =>
            [key, { '_TEXT': value }]));
}

class TestCritterParser extends CritterParser {
    public override getNaturalWeapons(powers: { _TEXT: string; $?: { select?: string } }[], options: { actorName: string }) {
        return super.getNaturalWeapons(powers, options);
    }
}

class TestItemAmmoParser extends ItemAmmoParser {
    public override getSystem(jsonData: any) {
        return super.getSystem(jsonData);
    }
}

export const weaponParserBaseTesting = (context: QuenchBatchContext) => {
    const { describe, it, assert } = context;

    const mut = new WeaponParserBase();

    describe("Weapon Damage Values", () => {
        it("Parses simple damage", () => {
            const output = mut.parseDamageData("12P", 0);
            assert.deepEqual(output, DataDefaults.createData('damage', {
                base: 12,
                value: 12,
                type: {
                    base: 'physical',
                    value: 'physical',
                },
            }));
        });

        it("Parses elemental damage", () => {
            const output = mut.parseDamageData("8S(e)", 0);
            assert.deepEqual(output, DataDefaults.createData('damage', {
                base: 8,
                value: 8,
                type: {
                    base: 'stun',
                    value: 'stun',
                },
                element: {
                    base: 'electricity',
                    value: 'electricity',
                },
            }));
        });

        it("Parses strength-based damage", () => {
            const output = mut.parseDamageData("({STR}+3)P", 0);
            assert.deepEqual(output, DataDefaults.createData('damage', {
                base: 3,
                value: 3,
                type: {
                    base: 'physical',
                    value: 'physical',
                },
                attribute: 'strength',
            }));
        });

        it("Parses damage without type as physical", () => {
            const output = mut.parseDamageData("11", 0);
            assert.deepEqual(output, DataDefaults.createData('damage', {
                base: 11,
                value: 11,
                type: {
                    base: 'physical',
                    value: 'physical',
                },
            }));
        });

        it("Parses 0 damage", () => {
            const output = mut.parseDamageData("0", 0);
            assert.deepEqual(output, DataDefaults.createData('damage', {
                base: 0,
                value: 0,
                type: {
                    base: 'physical',
                    value: 'physical',
                },
            }));
        });

        it("Parses basic matrix damage", () => {
            const output = mut.parseDamageData("7M", 0);
            assert.deepEqual(output, DataDefaults.createData('damage', {
                base: 7,
                value: 7,
                type: {
                    base: 'matrix',
                    value: 'matrix',
                },
            }));
        });

        it("Parses strength-based damage without modifier", () => {
            const output = mut.parseDamageData("({STR})P", 0);
            assert.deepEqual(output, DataDefaults.createData('damage', {
                base: 0,
                value: 0,
                type: {
                    base: 'physical',
                    value: 'physical',
                },
                attribute: 'strength',
            }));
        });

        it("Parses multiplied attribute damage", () => {
            const output = mut.parseDamageData("({MAG}*2)P", 0);
            assert.deepEqual(output, DataDefaults.createData('damage', {
                base: 2,
                value: 2,
                base_formula_operator: 'multiply',
                type: {
                    base: 'physical',
                    value: 'physical',
                },
                attribute: 'magic',
            }));
        });

        it("Parses attribute AP formulas", () => {
            const output = mut.parseDamageData("9P", "-{MAG}*0.5");
            assert.deepEqual(output, DataDefaults.createData('damage', {
                base: 9,
                value: 9,
                type: {
                    base: 'physical',
                    value: 'physical',
                },
                ap: {
                    base: -0.5,
                    value: -0.5,
                    attribute: 'magic',
                    base_formula_operator: 'multiply',
                },
            }));
        });

        it("Parses item imported Chummer attribute formulas using the Chummer attribute table", () => {
            for (const [chummerAttribute, systemAttribute] of Object.entries(Constants.attributeTable)) {
                const output = mut.parseAttributeFormula(`{${chummerAttribute}}+2`);
                if (!output) throw new Error(`Could not parse ${chummerAttribute} formula`);

                assert.strictEqual(output.base, 2, chummerAttribute);
                assert.strictEqual(output.attribute, systemAttribute, chummerAttribute);
                assert.strictEqual(output.base_formula_operator, 'add', chummerAttribute);
            }
        });

        it("Parses short fire elemental damage", () => {
            const output = mut.parseDamageData("8P(f)", 0);
            assert.deepEqual(output, DataDefaults.createData('damage', {
                base: 8,
                value: 8,
                type: {
                    base: 'physical',
                    value: 'physical',
                },
                element: {
                    base: 'fire',
                    value: 'fire',
                },
            }));
        });

        it("Leaves unsupported complex damage at defaults", () => {
            const output = mut.parseDamageData("({STR}+2)P + 12(e)", "-");
            assert.deepEqual(output, DataDefaults.createData('damage'));
        });

        it("Parses signed elemental damage modifiers", () => {
            const output = mut.parseDamageData("-2S(e)", 0);
            assert.deepEqual(output, DataDefaults.createData('damage', {
                base: -2,
                value: -2,
                type: {
                    base: 'stun',
                    value: 'stun',
                },
                element: {
                    base: 'electricity',
                    value: 'electricity',
                },
            }));
        });
    })

    describe("Actor Import Weapon Damage Values", () => {
        const actorWeaponParser = new ActorWeaponParser();

        it("Parses actor imported strength-based damage from rawdamage", () => {
            const output = actorWeaponParser.parseChummerDamage("({STR}+2)P", "7P")!;

            assert.strictEqual(output.damage, 2);
            assert.strictEqual(output.attribute, 'strength');
            assert.strictEqual(output.base_formula_operator, 'add');
            assert.strictEqual(output.type, 'physical');
        });

        it("Parses actor imported ranged damage from rawdamage", () => {
            const output = actorWeaponParser.parseChummerDamage("9P", "9P")!;

            assert.strictEqual(output.damage, 9);
            assert.strictEqual(output.attribute, '');
            assert.strictEqual(output.type, 'physical');
        });

        it("Parses actor imported strength-based stun damage without modifier", () => {
            const output = actorWeaponParser.parseChummerDamage("({STR})S", "5S")!;

            assert.strictEqual(output.damage, 0);
            assert.strictEqual(output.attribute, 'strength');
            assert.strictEqual(output.base_formula_operator, 'add');
            assert.strictEqual(output.type, 'stun');
        });

        it("Parses actor imported strength-based damage with negative modifier", () => {
            const output = actorWeaponParser.parseChummerDamage("({STR}-1)P", "4P")!;

            assert.strictEqual(output.damage, -1);
            assert.strictEqual(output.attribute, 'strength');
            assert.strictEqual(output.base_formula_operator, 'add');
            assert.strictEqual(output.type, 'physical');
        });

        it("Parses Chummer attribute formulas using the Chummer attribute table", () => {
            for (const [chummerAttribute, systemAttribute] of Object.entries(Constants.attributeTable)) {
                const output = actorWeaponParser.parseAttributeFormula(`{${chummerAttribute}}+2`);
                if (!output) throw new Error(`Could not parse ${chummerAttribute} formula`);

                assert.strictEqual(output.base, 2, chummerAttribute);
                assert.strictEqual(output.attribute, systemAttribute, chummerAttribute);
                assert.strictEqual(output.base_formula_operator, 'add', chummerAttribute);
            }
        });

        it("Parses actor imported multiplied attribute damage", () => {
            const output = actorWeaponParser.parseChummerDamage("({MAG}*2)P", "12P")!;

            assert.strictEqual(output.damage, 2);
            assert.strictEqual(output.attribute, 'magic');
            assert.strictEqual(output.base_formula_operator, 'multiply');
            assert.strictEqual(output.type, 'physical');
        });

        it("Parses actor imported elemental flat damage", () => {
            const output = actorWeaponParser.parseChummerDamage("8S(e)", "8S(e)")!;

            assert.strictEqual(output.damage, 8);
            assert.strictEqual(output.type, 'stun');
            assert.strictEqual(output.element, 'electricity');
        });

        it("Parses actor imported blast damage", () => {
            const output = actorWeaponParser.parseChummerDamage("16P (-2/m)", "16P (-2/m)")!;

            assert.strictEqual(output.damage, 16);
            assert.strictEqual(output.type, 'physical');
            assert.strictEqual(output.dropoff, -2);
            assert.strictEqual(output.radius, 8);
        });

        it("Falls back to damage_english when rawdamage cannot be translated", () => {
            const output = actorWeaponParser.parseChummerDamage("Special", "5P")!;

            assert.strictEqual(output.damage, 5);
            assert.strictEqual(output.attribute, '');
            assert.strictEqual(output.type, 'physical');
        });

        it("Returns null when rawdamage and damage_english cannot be translated", () => {
            const output = actorWeaponParser.parseChummerDamage("Special", "Missile");

            assert.strictEqual(output, null);
        });

        it("Parses actor imported attribute AP formula", () => {
            const output = actorWeaponParser.parseChummerAP("-{MAG}*0.5", "-3")!;

            assert.strictEqual(output.base, -0.5);
            assert.strictEqual(output.attribute, 'magic');
            assert.strictEqual(output.base_formula_operator, 'multiply');
        });

        it("Falls back to ap_english when rawap cannot be translated", () => {
            const output = actorWeaponParser.parseChummerAP("Special", "-2")!;

            assert.strictEqual(output.base, -2);
            assert.strictEqual(output.attribute, '');
            assert.strictEqual(output.base_formula_operator, 'add');
        });

        it("Returns null when rawap and ap_english cannot be translated", () => {
            const output = actorWeaponParser.parseChummerAP("Special", "-");

            assert.strictEqual(output, null);
        });
    });

    describe("Item Import Natural Weapon Values", () => {
        const critterParser = new TestCritterParser();

        it("Parses metatype natural weapon formulas from power select text", () => {
            const [item] = critterParser.getNaturalWeapons([{
                _TEXT: 'Natural Weapon',
                $: { select: 'Kick: DV ({STR} + 2)P, AP +1, +1 Reach' },
            }], { actorName: 'Centaur' });

            const system = (item as unknown as { system: Item.SystemOfType<'weapon'> }).system;
            assert.strictEqual(system.action.damage.base, 2);
            assert.strictEqual(system.action.damage.attribute, 'strength');
            assert.strictEqual(system.action.damage.ap.base, 1);
            assert.strictEqual(system.melee.reach, 1);
        });
    });

    describe("Item Import Ammo Bonus Values", () => {
        const ammoParser = new TestItemAmmoParser([] as any);

        it("Parses signed elemental ammo damage bonuses", () => {
            const output = ammoParser.getSystem({
                weaponbonus: {
                    damage: { _TEXT: '-2S(e)' },
                    ap: { _TEXT: '-5' },
                },
            });

            assert.strictEqual(output.damage, -2);
            assert.strictEqual(output.damageType, 'stun');
            assert.strictEqual(output.element, 'electricity');
            assert.strictEqual(output.ap, -5);
        });

        it("Parses ammo damage replacements with acid damage types", () => {
            const output = ammoParser.getSystem({
                weaponbonus: {
                    damagereplace: { _TEXT: '6P' },
                    damagetype: { _TEXT: 'Acid' },
                    apreplace: { _TEXT: '-5' },
                },
            });

            assert.strictEqual(output.damage, 6);
            assert.strictEqual(output.damageType, 'physical');
            assert.strictEqual(output.element, 'acid');
            assert.strictEqual(output.ap, -5);
        });
    });
}
