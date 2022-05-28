import {OpposedTest, OpposedTestData} from "./OpposedTest";
import DamageData = Shadowrun.DamageData;
import {CombatSpellRules} from "../rules/CombatSpellRules";
import {SpellcastingTest} from "./SpellcastingTest";

export interface IndirectCombatSpellDefenseTestData extends OpposedTestData {
    // Damage value of the attack
    incomingDamage: DamageData
    // Modified damage value of the attack after this defense (success or failure)
    modifiedDamage: DamageData
}

export class IndirectCombatSpellDefenseTest extends OpposedTest {
    data: IndirectCombatSpellDefenseTestData
    against: SpellcastingTest

    get _chatMessageTemplate() {
        return 'systems/shadowrun5e/dist/templates/rolls/defense-test-message.html'
    }

    _prepareData(data, options?) {
        data = super._prepareData(data, options);

        data.incomingDamage = foundry.utils.duplicate(data.against.damage);
        data.modifiedDamage = foundry.utils.duplicate(data.against.damage);

        return data;
    }

    async processSuccess() {
        await super.processSuccess();

        this.data.modifiedDamage = CombatSpellRules.modifyDamageAfterMiss(this.data.modifiedDamage);
    }

    async processFailure() {
        await super.processFailure();

        this.data.modifiedDamage = CombatSpellRules.modifyIndirectDamageAfterHit(
            this.data.modifiedDamage, this.against.hits.value, this.hits.value);
    }
}