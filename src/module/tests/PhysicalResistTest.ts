import {SuccessTest, SuccessTestData} from "./SuccessTest";
import {DataDefaults} from "../data/DataDefaults";
import {PartsList} from "../parts/PartsList";
import {CombatRules} from "../rules/CombatRules";
import {Helpers} from "../helpers";
import {PhysicalDefenseTestData} from "./PhysicalDefenseTest";
import {SoakFlow} from "../actor/flows/SoakFlow";
import ModifierTypes = Shadowrun.ModifierTypes;
import { Translation } from '../utils/strings';
import { DamageType, MinimalActionType } from "../types/item/Action";


export interface PhysicalResistTestData extends SuccessTestData {
    // The original test this resistance is taking its data from.
    following: PhysicalDefenseTestData
    // The damage BEFORE this test is done.
    incomingDamage: DamageType
    // The damage AFTER this test is done.
    modifiedDamage: DamageType
    // Determine if an actor should be knockedDown after a defense.
    knockedDown: boolean
}

export type PhysicalResistSuccessCondition = {
    test: () => boolean,
    label?: Translation,
    effect?: () => void,
}

/**
 * A physical resist test handles SR5#173 Defend B
 *
 * Physical resist specifically handles physical damage dealt by ranged, melee and physical spell attacks.
 */
export class PhysicalResistTest extends SuccessTest<PhysicalResistTestData> {

    override _prepareData(data: PhysicalResistTestData, options): any {
        data = super._prepareData(data, options);

        // Is this test part of a followup test chain? defense => resist
        if (data.following) {
            data.incomingDamage = foundry.utils.duplicate(data.following?.modifiedDamage || DataDefaults.createData('damage')) as DamageType;
            data.modifiedDamage = foundry.utils.duplicate(data.incomingDamage) as DamageType;
        // This test is part of either a standalone resist or created with its own data (i.e. edge reroll).
        } else {
            data.incomingDamage = data.incomingDamage ?? DataDefaults.createData('damage');
            data.modifiedDamage = foundry.utils.duplicate(data.incomingDamage) as DamageType;
        }

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
        return 'systems/shadowrun5e/dist/templates/rolls/defense-test-message.hbs';
    }

    override get _dialogTemplate(): string {
        return 'systems/shadowrun5e/dist/templates/apps/dialogs/physical-resist-test-dialog.hbs';
    }

    /**
     * This test type can't be extended.
     */
    override get canBeExtended() {
        return false;
    }

    static override _getDefaultTestAction(): Partial<MinimalActionType> {
        return {
            'attribute': 'body',
            'armor': true
        };
    }

    override get testCategories(): Shadowrun.ActionCategories[] {
        return ['resist']
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
        this.data.modifiedDamage = foundry.utils.duplicate(this.data.incomingDamage) as DamageType;
        this.data.modifiedDamage.base = this.data.incomingDamage.value;
        this.data.modifiedDamage.mod = [];
        //@ts-expect-error fvtt-types doesn't know about non-required field.
        this.data.modifiedDamage.override = undefined;
        this.data.modifiedDamage.ap.base = this.data.incomingDamage.ap.value;
        this.data.modifiedDamage.ap.mod = [];
        //@ts-expect-error fvtt-types doesn't know about non-required field.
        this.data.modifiedDamage.ap.override = undefined;

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
        return !!this.getSuccessCondition();
    }

    private isFullySoaked(): boolean {
        return this.data.incomingDamage.value <= this.hits.value;
    }

    private successConditions: PhysicalResistSuccessCondition[] = [
        {
            test: () => this.actor !== undefined && CombatRules.isBlockedByHardenedArmor(this.data.incomingDamage, 0, 0, this.actor),
            label: "SR5.TestResults.SoakBlockedByHardenedArmor",
            effect: () => {
                this.data.autoSuccess = true;
            }
        },
        {
            test: () => this.isFullySoaked(),
        },
    ]

    private getSuccessCondition(): PhysicalResistSuccessCondition|undefined {
        return this.successConditions.find(({ test }) => test());
    }

    override get showSuccessLabel(): boolean {
        return this.success;
    }

    override get successLabel(): Translation {
        return this.getSuccessCondition()?.label || 'SR5.TestResults.ResistedAllDamage';
    }
    override get failureLabel(): Translation {
        return 'SR5.TestResults.ResistedSomeDamage';
    }

    override async processSuccess() {
        await super.processSuccess();

        this.getSuccessCondition()?.effect?.();
    }

    override async evaluate(): Promise<this> {
        await super.evaluate();

        // Automatic hits from hardened armor (SR5#397)
        const armor = this.actor?.getArmor(this.data.modifiedDamage);
        if(armor?.hardened) {
            PartsList.AddUniquePart(this.hits.mod, 'SR5.AppendedHits', Math.ceil(armor.value/2));
            Helpers.calcTotal(this.hits);
        }

        return this;
    }

    override async processResults() {

        await super.processResults();

        if (!this.actor) return;

        // Handle damage modification.
        this.data.modifiedDamage = CombatRules.modifyDamageAfterResist(this.actor, this.data.modifiedDamage, this.hits.value);

        // Handle Knock Down Rules with legacy flow handling.
        this.data.knockedDown = new SoakFlow().knocksDown(this.data.modifiedDamage, this.actor);
    }
}