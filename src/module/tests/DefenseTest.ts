import {OpposedTest, OpposedTestData} from "./OpposedTest";
import DamageData = Shadowrun.DamageData;
import {DataDefaults} from "../data/DataDefaults";
import { Translation } from '../utils/strings';


export interface DefenseTestData extends OpposedTestData {
    // Damage value of the attack
    incomingDamage: DamageData
    // Modified damage value of the attack after this defense (success or failure)
    modifiedDamage: DamageData

    // Should this defense test cause an initiative modifier to be applied, use this value
    // It's also used for display in chat.
    iniMod: number|undefined
}


/**
 * A semi abstract class to be used by other classes as a common extension interface.
 *
 * Handle general damage data as well as general defense rules.
 */
export class DefenseTest<T extends DefenseTestData = DefenseTestData> extends OpposedTest<T> {

    override _prepareData(data, options?) {
        data = super._prepareData(data, options);

        const damage = data.against ? data.against.damage : DataDefaults.damageData();

        data.incomingDamage = foundry.utils.duplicate(damage);
        data.modifiedDamage = foundry.utils.duplicate(damage);

        return data;
    }

    override get _chatMessageTemplate() {
        return 'systems/shadowrun5e/dist/templates/rolls/defense-test-message.html'
    }

    override get successLabel(): Translation {
        return 'SR5.TestResults.AttackDodged';
    }

    override get failureLabel(): Translation {
        return 'SR5.TestResults.AttackHits';
    }

    /**
     * This test has changed the initiative score of its caster.
     */
    get hasChangedInitiative(): boolean {
        return this.data.iniMod !== undefined;
    }

    get initiativeModifier(): number {
        return this.data.iniMod || 0;
    }
}