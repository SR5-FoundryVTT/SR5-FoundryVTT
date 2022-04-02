import { DefaultValues } from "../data/DataDefaults";
import { Helpers } from "../helpers";
import { PartsList } from "../parts/PartsList";
import {OpposedTest, OpposedTestData, OpposedTestValues} from "./OpposedTest";
import DamageData = Shadowrun.DamageData;
import {PhysicalDefenseDialog} from "../apps/dialogs/PhysicalDefenseDialog";


interface PhysicalDefenseTestValues extends OpposedTestValues {
    damage: Shadowrun.DamageData
}

export interface PhysicalDefenseTestData extends OpposedTestData {
    values: PhysicalDefenseTestValues
}


export class PhysicalDefenseTest extends OpposedTest {
    public data: PhysicalDefenseTestData;

    _prepareData(data, options?): any {
        data = super._prepareData(data, options);

        data.values.damage = DefaultValues.damageData();
        data.modifiers = {
            'wounds': null
        }

        return data;
    }

    _createTestDialog() {
        return new PhysicalDefenseDialog({test: this});
    }

     async processSuccess() {

        // TODO: Move this into a rules file.
        const parts = new PartsList(this.damage.mod);
        parts.addPart('SR5.AttackHits', this.against.hits.value);
        parts.addPart('SR5.DefenderHits', -this.netHits.value);

        Helpers.calcTotal(this.damage, {min: 0});

    }

    get damage(): DamageData {
        return this.data.values.damage;
    }
}