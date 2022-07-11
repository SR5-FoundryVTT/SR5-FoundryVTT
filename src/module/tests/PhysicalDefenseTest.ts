import {PartsList} from "../parts/PartsList";
import {OpposedTest, OpposedTestData} from "./OpposedTest";
import DamageData = Shadowrun.DamageData;
import {CombatRules} from "../rules/CombatRules";
import {MeleeRules} from "../rules/MeleeRules";
import {MeleeAttackData} from "./MeleeAttackTest";
import {TestCreator} from "./TestCreator";
import {DefenseTest, DefenseTestData} from "./DefenseTest";
import {DefaultValues} from "../data/DataDefaults";

// TODO: reach
export interface PhysicalDefenseTestData extends DefenseTestData {
    // Dialog input for cover modifier
    cover: number
    // Dialog input for active defense modifier
    activeDefense: string
    activeDefenses: Record<string, any> // TODO: Propper typing...
    // Melee weapon reach modification.
    isMeleeAttack: boolean
    defenseReach: number
}


export class PhysicalDefenseTest extends DefenseTest {
    public data: PhysicalDefenseTestData;

    _prepareData(data, options?): any {
        data = super._prepareData(data, options);

        // TODO: this should be stored on actor flag and fetched in populateActorModifiers
        data.cover = 0;
        data.activeDefense = '';
        data.activeDefenses = {};
        data.isMeleeAttack = false;
        data.defenseReach = 0;

        return data;
    }

    get _chatMessageTemplate() {
        return 'systems/shadowrun5e/dist/templates/rolls/defense-test-message.html';
    }

    get _dialogTemplate(): string {
        return 'systems/shadowrun5e/dist/templates/apps/dialogs/physical-defense-test-dialog.html';
    }

    static _getDefaultTestAction() {
        return DefaultValues.minimalActionData({
            'attribute': 'reaction',
            'attribute2': 'intuition'
        });
    }

    get testModifiers() {
        return ['global', 'wounds', 'defense'];
    }

    async prepareDocumentData() {
        this.prepareActiveDefense();
        this.prepareMeleeReach();
    }

    prepareActiveDefense() {
        if (!this.actor) return;
        const actor = this.actor;

        // Default active defenses.
        this.data.activeDefenses = {
            full_defense: {
                label: 'SR5.FullDefense',
                value: actor.getFullDefenseAttribute()?.value,
                initMod: -10,
            },
            dodge: {
                label: 'SR5.Dodge',
                value: actor.findActiveSkill('gymnastics')?.value,
                initMod: -5,
            },
            block: {
                label: 'SR5.Block',
                value: actor.findActiveSkill('unarmed_combat')?.value,
                initMod: -5,
            }
        };

        // Collect weapon based defense options.
        // NOTE: This would be way better if the current weapon (this.item) would be used.
        const equippedMeleeWeapons = actor.getEquippedWeapons().filter((w) => w.isMeleeWeapon());
        equippedMeleeWeapons.forEach((weapon) => {
            this.data.activeDefenses[`parry-${weapon.name}`] = {
                label: 'SR5.Parry',
                weapon: weapon.name,
                value: actor.findActiveSkill(weapon.getActionSkill())?.value,
                init: -5,
            };
        });
    }

    prepareMeleeReach() {
        if (!this.against.item) return;
        this.data.isMeleeAttack = this.against.item.isMeleeWeapon();
        if (!this.data.isMeleeAttack) return;

        if (!this.actor) return;

        // Take the highest equipped melee reach to defend with...
        // NOTE: ... this should be a choice be the player
        const equippedMeleeWeapons = this.actor.getEquippedWeapons().filter((w) => w.isMeleeWeapon());
        equippedMeleeWeapons.forEach(weapon => {
            this.data.defenseReach = Math.max(this.data.defenseReach, weapon.getReach());
        });

        const attackData = this.against.data as MeleeAttackData;
        const incomingReach = attackData.reach || 0;
        const defenseReach = this.data.defenseReach;
        this.data.defenseReach = MeleeRules.defenseReachModifier(incomingReach, defenseReach);
    }

    applyPoolModifiers() {
        this.applyPoolCoverModifier();
        this.applyPoolActiveDefenseModifier();
        this.applyPoolMeleeReachModifier();
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

    applyPoolActiveDefenseModifier() {
        const defense = this.data.activeDefenses[this.data.activeDefense] || {label: 'SR5.ActiveDefense', value: 0, init: 0};

        // Apply zero modifier also, to sync pool.mod and modifiers.mod
        PartsList.AddUniquePart(this.data.modifiers.mod, 'SR5.ActiveDefense', defense.value);

        // TODO: Use defense.init to modify Combat initiative value.
    }

    applyPoolMeleeReachModifier() {
        if (!this.data.isMeleeAttack) return;

        PartsList.AddUniquePart(this.data.modifiers.mod, 'SR5.WeaponReach', this.data.defenseReach);
    }

    get success() {
        return CombatRules.attackMisses(this.against.hits.value, this.hits.value);
    }

    get failure() {
        return CombatRules.attackHits(this.against.hits.value, this.hits.value)
    }

    get successLabel() {
        return 'SR5.AttackDodged';
    }

    get failureLabel() {
        return 'SR5.AttackHits';
    }

    async processSuccess() {
        this.data.modifiedDamage = CombatRules.modifyDamageAfterMiss(this.data.incomingDamage);
    }

    async processFailure() {
        this.data.modifiedDamage = CombatRules.modifyDamageAfterHit(this.against.hits.value, this.hits.value, this.data.incomingDamage);
    }

    async afterFailure() {
        const test = await TestCreator.fromOpposedTestResistTest(this, this.data.options);
        if (!test) return;
        await test.execute();
    }
}