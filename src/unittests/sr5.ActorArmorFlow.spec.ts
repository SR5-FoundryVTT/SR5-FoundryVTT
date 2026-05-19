import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { DataDefaults } from '@/module/data/DataDefaults';
import { DamageType } from '@/module/types/item/Action';
import { ActorArmorFlow } from '@/module/actor/flows/ActorArmorFlow';
import { ActorArmorType } from '@/module/types/template/Armor';

type DamageElementType = DamageType['element']['base'];
type DamageTypeType = DamageType['type']['base'];

const getDamage = (
    damageValue: number,
    {
        type = "physical",
        ap = 0,
        element,
        normal_weapon = false
    }: {
        type?: DamageTypeType,
        ap?: number,
        element?: DamageElementType,
        normal_weapon?: boolean
    } = {}
): DamageType => DataDefaults.createData('damage', {
    type: { value: type, base: type },
    value: damageValue,
    base: damageValue,
    normal_weapon,
    ...(ap && { ap: { base: ap, value: ap } }),
    ...(element && { element: { base: element, value: element } }),
});

const getArmor = (): ActorArmorType => DataDefaults.createData('armor');

export const actorArmorFlowTesting = (context: QuenchBatchContext) => {
    const { describe, it } = context;
    const assert: Chai.AssertStatic = context.assert;

    describe('ActorArmorFlow', () => {
        it('adds elemental armor to rating', () => {
            const armor = getArmor();
            armor.rating.base = armor.rating.value = 6;
            armor.elements.fire.base = armor.elements.fire.value = 3;

            const modified = ActorArmorFlow.getArmor(armor, getDamage(4, { element: 'fire' }));

            assert.strictEqual(modified.rating.value, 9);
        });

        it('merges strongest matching immunity into hardened armor', () => {
            const armor = getArmor();
            armor.immunities.normal_weapons.base = armor.immunities.normal_weapons.value = 8;
            armor.immunities.fire.base = armor.immunities.fire.value = 12;

            const modified = ActorArmorFlow.getArmor(armor, getDamage(4, { normal_weapon: true, element: 'fire' }));

            assert.strictEqual(modified.hardened.value, 12);
        });

        it('applies positive AP to rating only', () => {
            const armor = getArmor();
            armor.rating.base = armor.rating.value = 6;
            armor.hardened.base = armor.hardened.value = 10;

            const modified = ActorArmorFlow.getArmor(armor, getDamage(4, { ap: 2 }));

            assert.strictEqual(modified.rating.value, 8);
            assert.strictEqual(modified.hardened.value, 10);
        });

        it('cascades negative AP to hardened first then rating', () => {
            const armor = getArmor();
            armor.rating.base = armor.rating.value = 6;
            armor.hardened.base = armor.hardened.value = 10;

            const modified = ActorArmorFlow.getArmor(armor, getDamage(4, { ap: -12 }));

            assert.strictEqual(modified.hardened.value, 0);
            assert.strictEqual(modified.rating.value, 4);
        });

        it('clamps cascaded AP results at zero', () => {
            const armor = getArmor();
            armor.rating.base = armor.rating.value = 6;
            armor.hardened.base = armor.hardened.value = 10;

            const modified = ActorArmorFlow.getArmor(armor, getDamage(4, { ap: -30 }));

            assert.strictEqual(modified.hardened.value, 0);
            assert.strictEqual(modified.rating.value, 0);
        });

        it('returns default armor when no system armor is provided', () => {
            const modified = ActorArmorFlow.getArmor(undefined, getDamage(4));
            assert.strictEqual(modified.rating.value, 0);
            assert.strictEqual(modified.hardened.value, 0);
        });

        it('returns unmodified armor shape when damage is omitted', () => {
            const armor = getArmor();
            armor.rating.base = armor.rating.value = 5;
            armor.hardened.base = armor.hardened.value = 2;

            const modified = ActorArmorFlow.getArmor(armor);

            assert.strictEqual(modified.rating.value, 5);
            assert.strictEqual(modified.hardened.value, 2);
        });
    });
};

