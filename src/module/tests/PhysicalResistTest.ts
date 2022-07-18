import {SuccessTest, SuccessTestData} from "./SuccessTest";
import {DefaultValues} from "../data/DataDefaults";
import {PartsList} from "../parts/PartsList";
import {CombatRules} from "../rules/CombatRules";
import {Helpers} from "../helpers";
import {PhysicalDefenseTestData} from "./PhysicalDefenseTest";
import DamageData = Shadowrun.DamageData;


export interface PhysicalResistTestData extends SuccessTestData {
    // The original test this resistance is taking its data from.
    following: PhysicalDefenseTestData
    // The damage BEFORE this test is done.
    incomingDamage: DamageData
    // The damage AFTER this test is done.
    modifiedDamage: DamageData
}


/**
 * A physical resist test handles SR5#173 Defend B
 *
 * Physical resist specifically handles physical damage dealt by ranged, melee and physical spell attacks.
 */
export class PhysicalResistTest extends SuccessTest {
    data: PhysicalResistTestData

    _prepareData(data, options): any {
        data = super._prepareData(data, options);

        // Get incoming damage from test before or default.
        data.incomingDamage = foundry.utils.duplicate(data.following?.modifiedDamage || DefaultValues.damageData());
        data.modifiedDamage = duplicate(data.incomingDamage);

        return data;
    }

    get _chatMessageTemplate() {
        return 'systems/shadowrun5e/dist/templates/rolls/defense-test-message.html';
    }

    get _dialogTemplate(): string {
        return 'systems/shadowrun5e/dist/templates/apps/dialogs/physical-resist-test-dialog.html';
    }

    /**
     * This test type can't be extended.
     */
    get canBeExtended() {
        return false;
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
                armor.mod = PartsList.AddUniquePart(armor.mod, 'SR5.AP', this.data.incomingDamage.ap.value);
                Helpers.calcTotal(armor, {min: 0});
                this.data.pool.mod = PartsList.AddUniquePart(this.data.pool.mod,'SR5.Armor', armor.value);
            }

        }
    }

    get canSucceed() {
        return false;
    }

    async processSuccess() {
        this.data.modifiedDamage = CombatRules.modifyDamageAfterResist(this.data.incomingDamage, this.hits.value);
    }
}