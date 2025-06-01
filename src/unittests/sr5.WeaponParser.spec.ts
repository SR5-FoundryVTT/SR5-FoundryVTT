import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { WeaponParserBase } from '../module/apps/itemImport/parser/weapon/WeaponParserBase';
import DamageData = Shadowrun.DamageData;
import { DataDefaults } from '../module/data/DataDefaults';
import { Weapon } from '../module/apps/itemImport/schema/WeaponsSchema';

class TestWeaponParser extends WeaponParserBase {
    public override GetDamage(jsonData: Weapon): DamageData {
        return super.GetDamage(jsonData);
    }
}

function mockXmlData(data: object): object {
    return Object.fromEntries(Object.entries(data)
        .map(([key, value]) =>
            [key, { '_TEXT': value }]));
}

function getData(damageString: string): Partial<Weapon> {
    return mockXmlData({
        damage: damageString,
    });
}

export const weaponParserBaseTesting = (context: QuenchBatchContext) => {
    const { describe, it, assert, before, after } = context;

    let mut = new TestWeaponParser(undefined as any);

    before(async () => {})
    after(async () => {})

    describe("Weapon Damage Values", () => {
        it("Parses simple damage", () => {
            const output = mut.GetDamage(getData("12P"));
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
            const output = mut.GetDamage(getData("8S(e)"));
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
            const output = mut.GetDamage(getData("({STR}+3)P"));
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
            const output = mut.GetDamage(getData("11"));
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
            const output = mut.GetDamage(getData("0"));
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
            const output = mut.GetDamage(getData("7M"));
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
            const output = mut.GetDamage(getData("({STR})P"));
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
    })
}

