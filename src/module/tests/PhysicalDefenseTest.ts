import {PartsList} from "../parts/PartsList";
import {CombatRules} from "../rules/CombatRules";
import {MeleeRules} from "../rules/MeleeRules";
import {MeleeAttackData} from "./MeleeAttackTest";
import {TestCreator} from "./TestCreator";
import {DefenseTest, DefenseTestData} from "./DefenseTest";
import {DefaultValues} from "../data/DataDefaults";
import { SR5Combat } from "../combat/SR5Combat";


export interface PhysicalDefenseTestData extends DefenseTestData {
    // Dialog input for cover modifier
    cover: number
    // Dialog input for active defense modifier
    activeDefense: string
    activeDefenses: Record<string, { label: string, value: number|undefined, initMod: number, weapon?: string }>
    // Melee weapon reach modification.
    isMeleeAttack: boolean
    defenseReach: number
}


export class PhysicalDefenseTest extends DefenseTest {
    public data: PhysicalDefenseTestData;

    _prepareData(data, options?): any {
        data = super._prepareData(data, options);

        data.cover = 0;
        data.activeDefense = '';
        data.activeDefenses = {};
        data.isMeleeAttack = false;
        data.defenseReach = 0;

        return data;
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
        await super.prepareDocumentData();
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
                weapon: weapon.name || '',
                value: actor.findActiveSkill(weapon.getActionSkill())?.value,
                initMod: -5,
            };
        });
    }

    prepareMeleeReach() {
        if (!this.against.item) return;
        this.data.isMeleeAttack = this.against.item.isMeleeWeapon();
        if (!this.data.isMeleeAttack) return;

        if (!this.actor) return;

        // Take the highest equipped melee reach to defend with...
        // NOTE: ... this should be a choice of the player
        // TODO: This is a legacy selection approach as there wasn't a way to access to used item in the original attack test.
        //       Instead this might be replaced with a direct reference with this.against.item.data.defenseReach?
        const equippedMeleeWeapons = this.actor.getEquippedWeapons().filter((w) => w.isMeleeWeapon());
        equippedMeleeWeapons.forEach(weapon => {
            this.data.defenseReach = Math.max(this.data.defenseReach, weapon.getReach());
        });

        const attackData = this.against.data as MeleeAttackData;
        const incomingReach = attackData.reach || 0;
        const defenseReach = this.data.defenseReach;
        this.data.defenseReach = MeleeRules.defenseReachModifier(incomingReach, defenseReach);
    }

    calculateBaseValues() {
        super.calculateBaseValues();
        this.applyIniModFromActiveDefense();
    }

    applyPoolModifiers() {
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
        PartsList.AddUniquePart(this.data.modifiers.mod, 'SR5.Cover', this.data.cover);
    }

    applyPoolActiveDefenseModifier() {
        const defense = this.data.activeDefenses[this.data.activeDefense] || {label: 'SR5.ActiveDefense', value: 0, init: 0};

        // Apply zero modifier also, to sync pool.mod and modifiers.mod
        PartsList.AddUniquePart(this.data.modifiers.mod, 'SR5.ActiveDefense', defense.value);
    }

    applyPoolMeleeReachModifier() {
        if (!this.data.isMeleeAttack) return;

        PartsList.AddUniquePart(this.data.modifiers.mod, 'SR5.WeaponReach', this.data.defenseReach);
    }

    /**
     * When defending against a ranged attack, see if any fire mode defense modifiers must be applied
     */
    applyPoolRangedFireModModifier() {
        if (!this.against.item) return;
        if (!this.against.item.isRangedWeapon()) return;

        const fireMode = this.against.item.getLastFireMode();

        if (!fireMode.defense) return;

        PartsList.AddUniquePart(this.data.modifiers.mod, fireMode.label, Number(fireMode.defense));
    }

    get success() {
        return CombatRules.attackMisses(this.against.hits.value, this.hits.value);
    }

    get failure() {
        return CombatRules.attackHits(this.against.hits.value, this.hits.value)
    }

    async processSuccess() {
        this.data.modifiedDamage = CombatRules.modifyDamageAfterMiss(this.data.incomingDamage);

        await super.processSuccess();
    }

    async processFailure() {
        this.data.modifiedDamage = CombatRules.modifyDamageAfterHit(this.against.hits.value, this.hits.value, this.data.incomingDamage);

        await super.processFailure();
    }

    async afterFailure() {
        const test = await TestCreator.fromOpposedTestResistTest(this, this.data.options);
        if (!test) return;
        await test.execute();
    }

    canConsumeDocumentRessources() {
        // Check if the actor is in active combat situation and has enough initiative score left.
        if (this.actor && this.data.iniMod && game.combat) {
            const combat: SR5Combat = game.combat as unknown as SR5Combat;
            const combatant = combat.getActorCombatant(this.actor);
            if (combatant && combatant.initiative + this.data.iniMod < 0) {
                ui.notifications?.warn('SR5.MissingRessource.Initiative', {localize: true});
                return false;
            }
        }

        return super.canConsumeDocumentRessources();
    }

    /**
     * Should an active defense be selected apply the initiative modifier to the defenders combat initiative.
     */
    applyIniModFromActiveDefense() {
        if (!this.actor) return;
        if (!this.data.activeDefense) return;

        const activeDefense = this.data.activeDefenses[this.data.activeDefense];
        if (!activeDefense) return;

        // Use DefenseTest general iniMod behaviour.
        this.data.iniMod = activeDefense.initMod;
    }

    _prepareResultActionsTemplateData() {
        const actions = super._prepareResultActionsTemplateData();

        // Don't add an action if no active defense was selected.
        if (!this.data.activeDefense) return actions;

        const activeDefense = this.data.activeDefenses[this.data.activeDefense];
        if (!activeDefense) return actions;

        actions.push({
            action: 'modifyCombatantInit',
            label: 'SR5.Initiative',
            value: String(activeDefense.initMod)
        });

        return actions;
    }
}