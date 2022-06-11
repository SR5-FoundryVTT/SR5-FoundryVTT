import {SuccessTest, SuccessTestData, TestOptions} from "./SuccessTest";
import {OpposedTestData} from "./OpposedTest";
import {DefaultValues} from "../data/DataDefaults";
import {PartsList} from "../parts/PartsList";
import {CombatRules} from "../rules/CombatRules";
import {Helpers} from "../helpers";

export interface PhysicalResistTestData extends SuccessTestData {
    // The original test this resistance is taking its data from.
    following: OpposedTestData
}


/**
 * A physical resist test handles SR5#173 Defend B
 *
 * Physical resist specifically handles physical damage dealt by ranged, melee and physical spell attacks.
 */
export class PhysicalResistTest extends SuccessTest {
    _prepareData(data, options: TestOptions): any {
        data = super._prepareData(data, options);

        // Get damage after it's been modified by previous defense.
        const incomingModifiedDamage = foundry.utils.duplicate(data.following.modifiedDamage);
        data.damage = data.damage ? incomingModifiedDamage : DefaultValues.damageData();

        // NOTE: this is dev testing... should be removed
        data.opposed = {};

        return data;
    }

    static _getDefaultTestAction() {
        return DefaultValues.minimalActionData({
            'attribute': 'body',
            'armor': true
        });
    }

    get testModifiers() {
        return ['soak'];
    }

    applyPoolModifiers() {
        super.applyPoolModifiers();

        if (this.data.action.armor) {
            if (this.actor) {
                const armor = foundry.utils.duplicate(this.actor.getArmor());
                armor.mod = PartsList.AddUniquePart(armor.mod, 'SR5.AP', this.data.damage.ap.value);
                Helpers.calcTotal(armor, {min: 0});
                this.data.pool.mod = PartsList.AddUniquePart(this.data.pool.mod,'SR5.Armor', armor.value);
            }

        }
    }

    get canSucceed() {
        return false;
    }

    async processSuccess() {
        this.data.damage = CombatRules.modifyDamageAfterResist(this.data.damage, this.hits.value);
    }
}