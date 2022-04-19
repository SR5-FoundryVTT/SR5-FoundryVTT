import { Helpers } from "../helpers";
import { PartsList } from "../parts/PartsList";
import {OpposedTest, OpposedTestData} from "./OpposedTest";
import DamageData = Shadowrun.DamageData;

export interface PhysicalDefenseTestData extends OpposedTestData {
    modDamage: DamageData
}

export class PhysicalDefenseTest extends OpposedTest {
    public data: PhysicalDefenseTestData;

    _prepareData(data, options?): any {
        data = super._prepareData(data, options);

        // Copy incoming damage to have a later display of both incoming and modified damage.
        data.modDamage = foundry.utils.duplicate(data.against.damage);

        return data;
    }

    get _chatMessageTemplate() {
        return 'systems/shadowrun5e/dist/templates/rolls/physical-defense-test-message.html'
    }

    get _dialogTemplate(): string {
        return 'systems/shadowrun5e/dist/templates/apps/dialogs/physical-defense-test-dialog.html';
    }

    async prepareDocumentData() {
        await super.prepareDocumentData();
    }

    /**
     * A DefenseTest is successful not when there are any netHits but as soon as the hits cross
     * the threshold.
     */
    get success() {
        return this.hits.value >= this.threshold.value;
    }

    async processSuccess() {
        // A successful defense will result in no damage taken.
        // TODO: Move this into a rules file.
        this.data.modDamage.override = {name: 'SR5.Success', value: 0};
        Helpers.calcTotal(this.data.modDamage, {min: 0});
    }

    async processFailure() {
        // TODO: Move this into a rules file.
        // A failed defense will result in damage taken.
        const parts = new PartsList(this.data.modDamage.mod);
        if (this.hits.value > 0)
            parts.addPart('SR5.DefenderHits', -this.hits.value);

        Helpers.calcTotal(this.data.modDamage, {min: 0});
    }
}