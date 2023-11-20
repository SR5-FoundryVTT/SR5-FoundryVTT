import {SuccessTest, SuccessTestData} from "./SuccessTest";
import {DataDefaults} from "../data/DataDefaults";
import {PartsList} from "../parts/PartsList";
import {CombatRules} from "../rules/CombatRules";
import {Helpers} from "../helpers";
import {PhysicalDefenseTestData} from "./PhysicalDefenseTest";
import {SoakFlow} from "../actor/flows/SoakFlow";
import DamageData = Shadowrun.DamageData;
import MinimalActionData = Shadowrun.MinimalActionData;
import ModifierTypes = Shadowrun.ModifierTypes;
import { Translation } from '../utils/strings';


export interface PhysicalResistTestData extends SuccessTestData {
    // The original test this resistance is taking its data from.
    following: PhysicalDefenseTestData
    // The damage BEFORE this test is done.
    incomingDamage: DamageData
    // The damage AFTER this test is done.
    modifiedDamage: DamageData
    // Determine if an actor should be knockedDown after a defense.
    knockedDown: boolean
}


/**
 * A physical resist test handles SR5#173 Defend B
 *
 * Physical resist specifically handles physical damage dealt by ranged, melee and physical spell attacks.
 */
export class PhysicalResistTest extends SuccessTest {
    override data: PhysicalResistTestData

    override _prepareData(data, options): any {
        data = super._prepareData(data, options);

        // Get incoming damage from test before or default.
        data.incomingDamage = foundry.utils.duplicate(data.following?.modifiedDamage || DataDefaults.damageData());
        data.modifiedDamage = foundry.utils.duplicate(data.incomingDamage);

        const armor = this.actor?.getArmor();
        if(armor?.hardened){
            data.hitsIcon = {
                icon: "systems/shadowrun5e/dist/icons/bell-shield.svg",
                tooltip: "SR5.ArmorHardenedFull",
            };
        }

        return data;
    }

    override get _chatMessageTemplate() {
        return 'systems/shadowrun5e/dist/templates/rolls/defense-test-message.html';
    }

    override get _dialogTemplate(): string {
        return 'systems/shadowrun5e/dist/templates/apps/dialogs/physical-resist-test-dialog.html';
    }

    /**
     * This test type can't be extended.
     */
    override get canBeExtended() {
        return false;
    }

    static override _getDefaultTestAction(): Partial<MinimalActionData> {
        return {
            'attribute': 'body',
            'armor': true
        };
    }

    override get testModifiers(): ModifierTypes[] {
        return ['soak'];
    }

    override applyPoolModifiers() {
        super.applyPoolModifiers();
        this.applyArmorPoolModifier();
    }

    /**
     * Resisting against damage on the physical plane includes the modified armor value.
     */
    applyArmorPoolModifier() {
        if (this.data.action.armor) {
            if (this.actor) {
                const armor = this.actor.getArmor(this.data.incomingDamage);
                this.data.pool.mod = PartsList.AddUniquePart(this.data.pool.mod,'SR5.Armor', armor.value);
            }
        }
    }

    override calculateBaseValues() {
        super.calculateBaseValues();

        // Calculate damage values in case of user dialog interaction.
        Helpers.calcTotal(this.data.incomingDamage, {min: 0});
        Helpers.calcTotal(this.data.incomingDamage.ap);

        // Remove user override and resulting incoming damage as base.
        this.data.modifiedDamage = foundry.utils.duplicate(this.data.incomingDamage);
        this.data.modifiedDamage.base = this.data.incomingDamage.value;
        this.data.modifiedDamage.mod = [];
        delete this.data.modifiedDamage.override;
        this.data.modifiedDamage.ap.base = this.data.incomingDamage.ap.value;
        this.data.modifiedDamage.ap.mod = [];
        delete this.data.modifiedDamage.ap.override;

        Helpers.calcTotal(this.data.modifiedDamage);
        Helpers.calcTotal(this.data.modifiedDamage.ap);
    }

    override get canSucceed() {
        return true;
    }

    /**
     * Resist Test success means ALL damage has been soaked.
     */
    override get success() {
        if(this.actor) {
            const armor = this.actor.getArmor(this.data.incomingDamage);

            if(armor.hardened) {
                if(this.data.incomingDamage.value < armor.value) {
                    //Automatic success
                    return true;
                }

                const soaked = this.hits.value + Math.ceil(armor.value/2);
                return this.data.incomingDamage.value <= soaked;
            }
        }

        return this.data.incomingDamage.value <= this.hits.value;
    }

    override get showSuccessLabel(): boolean {
        return this.success;
    }

    override get successLabel(): Translation {
        return 'SR5.TestResults.ResistedAllDamage';
    }
    override get failureLabel(): Translation {
        return 'SR5.TestResults.ResistedSomeDamage';
    }

    override async processResults() {
        await super.processResults();

        if (!this.actor) return;

        // Handle damage modification.
        this.data.modifiedDamage = CombatRules.modifyDamageAfterResist(this.actor, this.data.modifiedDamage, this.hits.value);

        // Handle Knock Down Rules with legacy flow handling.
        this.data.knockedDown = new SoakFlow().knocksDown(this.data.modifiedDamage, this.actor);

        const armor = this.actor.getArmor(this.data.modifiedDamage);
        if(armor.hardened){
            this.data.appendedHits = Math.ceil(armor.value/2);
        }
    }
}