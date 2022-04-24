import {Helpers} from "../helpers";
import {PartsList} from "../parts/PartsList";
import {OpposedTest, OpposedTestData} from "./OpposedTest";
import DamageData = Shadowrun.DamageData;
import {CombatRules} from "../rules/CombatRules";

// TODO: reach
export interface PhysicalDefenseTestData extends OpposedTestData {
    // Damage value of the attack
    incomingDamage: DamageData
    // Modified damage value of the attack after this defense (success or failure)
    modifiedDamage: DamageData

    // Dialog input for cover modifier
    cover: number
}

export class PhysicalDefenseTest extends OpposedTest {
    public data: PhysicalDefenseTestData;

    _prepareData(data, options?): any {
        data = super._prepareData(data, options);

        data.incomingDamage = foundry.utils.duplicate(data.against.damage);
        data.modifiedDamage = foundry.utils.duplicate(data.against.damage);

        // TODO: this should be stored on actor flag and fetched in populateActorModifiers
        data.cover = 0;

        return data;
    }

    get _chatMessageTemplate() {
        return 'systems/shadowrun5e/dist/templates/rolls/physical-defense-test-message.html'
    }

    get _dialogTemplate(): string {
        return 'systems/shadowrun5e/dist/templates/apps/dialogs/physical-defense-test-dialog.html';
    }

    async prepareDocumentData() {

    }

    applyPoolModifiers() {
        this.applyPoolCoverModifier();
        super.applyPoolModifiers();
    }

    applyPoolCoverModifier() {
        // Cast dialog selection to number, when necessary.
        this.data.cover = foundry.utils.getType(this.data.cover) === 'string' ?
            Number(this.data.cover) :
            this.data.cover;

        // Apply zero modifier also, to sync pool.mod and modifiers.mod
        PartsList.AddUniquePart(this.data.modifiers.mod, 'SR5.Cover', this.data.cover);
    }

    get success() {
        return CombatRules.attackMisses(this.against.hits.value, this.hits.value);
    }

    get failure() {
        return CombatRules.attackHits(this.against.hits.value, this.hits.value)
    }

    async processSuccess() {
        this.data.modifiedDamage = CombatRules.modifyDamageAfterMiss(this.data.incomingDamage);
    }

    async processFailure() {
        this.data.modifiedDamage = CombatRules.modifyDamageAfterHit(this.against.hits.value, this.hits.value, this.data.incomingDamage);
    }
}