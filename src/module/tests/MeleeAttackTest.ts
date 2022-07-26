import {SuccessTest, SuccessTestData} from "./SuccessTest";
import {DefaultValues} from "../data/DataDefaults";

export interface MeleeAttackData extends SuccessTestData {
    reach: number
}

export class MeleeAttackTest extends SuccessTest {
    data: MeleeAttackData;

    _prepareData(data, options): any {
        data = super._prepareData(data, options);

        data.damage = data.damage || DefaultValues.damageData();

        return data;
    }

    /**
     * This test type can't be extended.
     */
    get canBeExtended() {
        return false;
    }

    /**
     * While an attack can succeed,it's not really successful until defense.
     */
    get successLabel() {
        return "SR5.Results";
    }

     get testModifiers() {
        return ['global', 'wounds', 'environmental'];
    }

     get _dialogTemplate(): string {
        return 'systems/shadowrun5e/dist/templates/apps/dialogs/melee-attack-test-dialog.html';
    }

    async prepareDocumentData() {
        if (!this.item || !this.item.isMeleeWeapon()) return;

        this.data.reach = this.item.getReach();
    }
}