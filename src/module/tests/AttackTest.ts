import {SuccessTest, SuccessTestData, SuccessTestValues, TestOptions} from "./SuccessTest";
import DamageData = Shadowrun.DamageData;
import { SR5Item } from "../item/SR5Item";
import { SR5Actor } from "../actor/SR5Actor";
import {DefaultValues} from "../data/DataDefaults";
import {PartsList} from "../parts/PartsList";
import { Helpers } from "../helpers";

export interface AttackTestData extends SuccessTestData {
    damage: DamageData
}

export class AttackTest extends SuccessTest {
    // TODO: Is this needed here?
    _prepareData(data, options?: TestOptions): any {
        data = super._prepareData(data, options);

        data.values.damage = DefaultValues.damageData();

        return data;
    }

    async processSuccess(): Promise<void> {
        const parts = new PartsList(this.data.damage.mod);
        parts.addUniquePart('SR5.NetHits', this.netHits.value);
        this.data.damage.value = Helpers.calcTotal(this.data.damage, {min: 0});
    }
}