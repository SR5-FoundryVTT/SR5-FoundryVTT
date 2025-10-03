import {PartsList} from "../parts/PartsList";
import {CombatRules} from "../rules/CombatRules";
import {MeleeRules} from "../rules/MeleeRules";
import {MeleeAttackData} from "./MeleeAttackTest";
import {TestCreator} from "./TestCreator";
import {DefenseTest, DefenseTestData} from "./DefenseTest";
import ModifierTypes = Shadowrun.ModifierTypes;
import { FLAGS, SYSTEM_NAME } from "../constants";
import { Translation } from '../utils/strings';
import { ActiveDefenseRules } from "../rules/ActiveDefenseRules";
import { DeepPartial } from "fvtt-types/utils";
import { MinimalActionType } from "../types/item/Action";
import { SR5Item } from "../item/SR5Item";

export interface PhysicalDefenseTestData extends DefenseTestData {
    // Dialog input for cover modifier
    cover: number
    // Melee weapon reach modification.
    isMeleeAttack: boolean
    defenseReach: number
}

export type PhysicalDefenseNoDamageCondition = {
    test: () => boolean,
    label: Translation,
}

export class PhysicalDefenseTest<T extends PhysicalDefenseTestData = PhysicalDefenseTestData> extends DefenseTest<T> {

    override _prepareData(data, options?): any {
        data = super._prepareData(data, options);

        data.cover = 0;
        data.activeDefense = '';
        data.activeDefenses = {};
        data.isMeleeAttack = false;
        data.defenseReach = 0;

        return data;
    }

    override get _dialogTemplate(): string {
        return 'systems/shadowrun5e/dist/templates/apps/dialogs/physical-defense-test-dialog.hbs';
    }

    static override _getDefaultTestAction(): DeepPartial<MinimalActionType> {
        return { attribute: 'reaction', attribute2: 'intuition' };
    }

    override get testCategories(): Shadowrun.ActionCategories[] {
        return ['defense']
    }

    override get testModifiers(): ModifierTypes[] {
        return ['global', 'wounds', 'defense', 'multi_defense'];
    }

    override async prepareDocumentData() {
        this.prepareActiveDefense();
        this.prepareMeleeReach();
        await super.prepareDocumentData();
    }

    /**
     * Depending on the weapon used for attack different active defenses are available.
     */
    prepareActiveDefense() {
        if (!this.actor) return;
        const actor = this.actor;

        const weapon = this.against.item;
        if (weapon === undefined) return;
        
        this.data.activeDefenses = ActiveDefenseRules.availableActiveDefenses(weapon as SR5Item<'weapon'>, actor);

        // Filter available active defenses by available ini score.
        this._filterActiveDefenses();
    }

    prepareMeleeReach() {
        if (!this.against.item) return;
        this.data.isMeleeAttack = this.against.item.isMeleeWeapon();
        if (!this.data.isMeleeAttack) return;

        if (!this.actor) return;

        // Take the highest equipped melee reach to defend with...
        // NOTE: ... this should be a choice of the player
        // TODO: This is a legacy selection approach as there wasn't a way to access to used item in the original attack test.
        //       Instead this might be replaced with a direct reference with this.against.item.system.defenseReach?
        const equippedMeleeWeapons = this.actor.getEquippedWeapons().filter((weapon) => weapon.isMeleeWeapon());
        equippedMeleeWeapons.forEach(weapon => {
            this.data.defenseReach = Math.max(this.data.defenseReach, weapon.getReach());
        });

        const attackData = this.against.data as MeleeAttackData;
        const incomingReach = attackData.reach || 0;
        const defenseReach = this.data.defenseReach;
        this.data.defenseReach = MeleeRules.defenseReachModifier(incomingReach, defenseReach);
    }

    override applyPoolModifiers() {
        this.applyPoolCoverModifier();
        this.applyPoolActiveDefenseModifier();
        this.applyPoolMeleeReachModifier();
        this.applyPoolRangedFireModModifier();
        super.applyPoolModifiers();
    }

    applyPoolCoverModifier() {
        // Cast dialog selection to number, when necessary.
        this.data.cover = foundry.utils.getType(this.data.cover) === 'string' ?
            Number(this.data.cover) :
            this.data.cover;

        // Apply zero modifier also, to sync pool.mod and modifiers.mod
        new PartsList(this.data.modifiers).addUniquePart('SR5.Cover', this.data.cover);
    }

    applyPoolActiveDefenseModifier() {
        const defense = this.data.activeDefenses[this.data.activeDefense] || {label: 'SR5.ActiveDefense', value: 0, init: 0};

        // Apply zero modifier also, to sync pool.mod and modifiers.mod
        new PartsList(this.data.modifiers).addUniquePart('SR5.ActiveDefense', defense.value || 0);
    }

    applyPoolMeleeReachModifier() {
        if (!this.data.isMeleeAttack) return;

        new PartsList(this.data.modifiers).addUniquePart('SR5.Weapon.Reach', this.data.defenseReach);
    }

    /**
     * When defending against a ranged attack, see if any fire mode defense modifiers must be applied
     */
    applyPoolRangedFireModModifier() {
        if (!this.against.item) return;
        if (!this.against.item.isRangedWeapon()) return;

        const fireMode = this.against.item.getLastFireMode();

        if (!fireMode.defense) return;

        new PartsList(this.data.modifiers).addUniquePart(fireMode.label, Number(fireMode.defense));
    }

    override get success() {
        return CombatRules.attackMisses(this.against.hits.value, this.hits.value);
    }

    override get failure() {
        return CombatRules.attackHits(this.against.hits.value, this.hits.value);
    }


    // Order is important in this array to determine which label is shown, determined by the first test whose function returns a truthy value
    private readonly noDamageConditions: PhysicalDefenseNoDamageCondition[] = [
        {
            test: () => this.actor !== undefined && CombatRules.doesNoPhysicalDamageToVehicle(this.data.incomingDamage, this.actor),
            label: "SR5.TestResults.AttackDoesNoPhysicalDamageToVehicle",
        },
        {
            test: () => this.actor !== undefined && CombatRules.isBlockedByVehicleArmor(this.data.incomingDamage, this.against.hits.value, this.hits.value, this.actor),
            label: "SR5.TestResults.AttackBlockedByVehicleArmor",
        },
        {
            test: () => this.actor !== undefined && CombatRules.isBlockedByHardenedArmor(this.data.incomingDamage, this.against.hits.value, this.hits.value, this.actor),
            label: "SR5.TestResults.AttackBlockedByHardenedArmor",
        }
    ];

    private getNoDamageCondition(): PhysicalDefenseNoDamageCondition|undefined {
        return this.noDamageConditions.find(({ test }) => test());
    }

    override get failureLabel(): Translation {
        return this.getNoDamageCondition()?.label || super.failureLabel;
    }

    override async processResults() {
        await super.processResults();

        await this.applyActorEffectsForDefense();
    }

    override async processSuccess() {
        this.data.modifiedDamage = CombatRules.modifyDamageAfterMiss(this.data.incomingDamage);

        await super.processSuccess();
    }

    override async processFailure() {
        if (!this.actor) return;

        if(this.getNoDamageCondition()) {
            this.data.modifiedDamage = CombatRules.modifyDamageAfterMiss(this.data.incomingDamage, true);
        } else {
            this.data.modifiedDamage = CombatRules.modifyDamageAfterHit(this.actor, this.against.hits.value, this.hits.value, this.data.incomingDamage);
        }

        await super.processFailure();
    }

    override async afterFailure() {
        await super.afterFailure();

        // If attack hits but does no damage, don't perform the follow-up physical resist test
        if(this.getNoDamageCondition()) {
            return;
        }

        const test = await TestCreator.fromOpposedTestResistTest(this, this.data.options);
        if (!test) return;
        await test.execute();
    }

    /**
     * Increase the actors multi defense modifier.
     */
    async applyActorEffectsForDefense() {
        if (!this.actor) return;

        return this.actor.calculateNextDefenseMultiModifier();
    }
}
