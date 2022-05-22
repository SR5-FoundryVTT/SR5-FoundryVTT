import {SuccessTest, SuccessTestData, TestDocuments, TestOptions} from "./SuccessTest";
import {OpposedTest, OpposedTestData} from "./OpposedTest";
import {SR5Actor} from "../actor/SR5Actor";
import DamageData = Shadowrun.DamageData;
import {DefaultValues} from "../data/DataDefaults";
import {PartsList} from "../parts/PartsList";
import {CombatRules} from "../rules/CombatRules";
import {Helpers} from "../helpers";

export interface PhysicalResistTestData extends SuccessTestData {
    // The original test this resistance is taking its data from.
    resisting: OpposedTestData
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
        const incomingModifiedDamage = foundry.utils.duplicate(data.resisting.modifiedDamage);
        data.damage = data.damage ? incomingModifiedDamage : DefaultValues.damageData();

        // NOTE: this is dev testing... should be removed
        data.opposed = {};

        return data;
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

        console.error(this.data.pool);
    }

    async execute(): Promise<this> {
        return super.execute();
    }

    /**
     * TODO: This is complicated and confusing. Maybe have a TestCreation handler for SuccessTest, OpposedTest, ResistTest, TeamTest and so forth
     * @param testData The original test that we're resisting against.
     * @param actor
     * @param previousMessageId
     */
    static async getResistActionTestData(testData, actor: SR5Actor, previousMessageId: string) {
        const data = await this._getDefaultActionTestData(actor);

        data.previousMessageId = previousMessageId;
        data.resisting = testData;

        return data;
    }

    async processSuccess() {
        this.data.damage = CombatRules.modifyDamageAfterResist(this.data.damage, this.hits.value);
    }
}