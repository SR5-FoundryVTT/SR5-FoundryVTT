import {SuccessTest, SuccessTestData, SuccessTestValues, TestOptions} from "./SuccessTest";
import ValueField = Shadowrun.ValueField;
import DamageData = Shadowrun.DamageData;
import {SR5ItemSheet} from "../item/SR5ItemSheet";
import { SR5Item } from "../item/SR5Item";
import { SR5Actor } from "../actor/SR5Actor";
import {DefaultValues} from "../data/DataDefaults";
import {PartsList} from "../parts/PartsList";
import {PhysicalDefenseDialog} from "../apps/dialogs/PhysicalDefenseDialog";

export interface AttackTestValues extends SuccessTestValues {
    damage: DamageData
    ap: ValueField
}
export interface AttackTestData extends SuccessTestData {
    values: AttackTestValues
}

export class AttackTest extends SuccessTest {
    _prepareData(data, options?: TestOptions): any {
        data = super._prepareData(data, options);

        data.values.damage = DefaultValues.damageData();

        return data;
    }

    static getItemActionTestData(item: SR5Item, actor: SR5Actor): AttackTestData {
        const data = AttackTest.getItemActionTestData(item, actor);

        const action = item.getAction();
        if (!action || !actor) return data;

        if (action.damage.type.base) {
            // TODO: Actual damage value calculation from actor to a numerical value.
            data.values.damage.base = action.damage.base;
        }
        if (action.damage.attribute) {
            const attribute = actor.getAttribute(action.damage.attribute);
            const value = attribute.value;
            console.error('Do attribute modification');
            data.values.damage.mod = PartsList.AddUniquePart(data.values.damage.mod, attribute.label, value);
        }

        return data;
    }
}