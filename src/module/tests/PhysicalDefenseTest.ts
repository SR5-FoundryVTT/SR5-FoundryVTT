import {PartsList} from "../parts/PartsList";
import {CombatRules} from "../rules/CombatRules";
import {MeleeRules} from "../rules/MeleeRules";
import {MeleeAttackData} from "./MeleeAttackTest";
import {TestCreator} from "./TestCreator";
import {DefenseTest, DefenseTestData} from "./DefenseTest";
import { SR5Combat } from "../combat/SR5Combat";
import MinimalActionData = Shadowrun.MinimalActionData;
import ModifierTypes = Shadowrun.ModifierTypes;
import { FLAGS, SYSTEM_NAME } from "../constants";


export interface PhysicalDefenseTestData extends DefenseTestData {
    // Dialog input for cover modifier
    cover: number
    // Dialog input for active defense modifier
    activeDefense: string
    activeDefenses: Record<string, { label: string, value: number|undefined, initMod: number, weapon?: string, disabled?: boolean }>
    // Melee weapon reach modification.
    isMeleeAttack: boolean
    defenseReach: number
}


export class PhysicalDefenseTest extends DefenseTest {
    public override data: PhysicalDefenseTestData;

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
        return 'systems/shadowrun5e/dist/templates/apps/dialogs/physical-defense-test-dialog.html';
    }

    static override _getDefaultTestAction(): Partial<MinimalActionData> {
        return {
            'attribute': 'reaction',
            'attribute2': 'intuition'
        };
    }

    override get testModifiers(): ModifierTypes[] {
        return ['global', 'wounds', 'defense', 'multi_defense'];
    }

    override async prepareDocumentData() {
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
        const equippedMeleeWeapons = actor.getEquippedWeapons().filter((weapon) => weapon.isMeleeWeapon);
        equippedMeleeWeapons.forEach((weapon) => {
            this.data.activeDefenses['parry'] = {
                label: 'SR5.Parry',
                weapon: weapon.name || '',
                value: actor.findActiveSkill(weapon.getActionSkill())?.value,
                initMod: -5,
            };
        });

        // Filter available active defenes by available ini score.
        this._filterActiveDefenses();
    }

    prepareMeleeReach() {
        if (!this.against.item) return;
        this.data.isMeleeAttack = this.against.item.isMeleeWeapon;
        if (!this.data.isMeleeAttack) return;

        if (!this.actor) return;

        // Take the highest equipped melee reach to defend with...
        // NOTE: ... this should be a choice of the player
        // TODO: This is a legacy selection approach as there wasn't a way to access to used item in the original attack test.
        //       Instead this might be replaced with a direct reference with this.against.item.data.defenseReach?
        const equippedMeleeWeapons = this.actor.getEquippedWeapons().filter((weapon) => weapon.isMeleeWeapon);
        equippedMeleeWeapons.forEach(weapon => {
            this.data.defenseReach = Math.max(this.data.defenseReach, weapon.getReach());
        });

        const attackData = this.against.data as MeleeAttackData;
        const incomingReach = attackData.reach || 0;
        const defenseReach = this.data.defenseReach;
        this.data.defenseReach = MeleeRules.defenseReachModifier(incomingReach, defenseReach);
    }

    override calculateBaseValues() {
        super.calculateBaseValues();
        this.applyIniModFromActiveDefense();
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
        if (!this.against.item.isRangedWeapon) return;

        const fireMode = this.against.item.getLastFireMode();

        if (!fireMode.defense) return;

        PartsList.AddUniquePart(this.data.modifiers.mod, fireMode.label, Number(fireMode.defense));
    }

    override get success() {
        return CombatRules.attackMisses(this.against.hits.value, this.hits.value) || (this.actor !== undefined &&
            (CombatRules.isBlockedByVehicleArmor(this.data.incomingDamage, this.against.hits.value, this.hits.value, this.actor) ||
            CombatRules.doesNoPhysicalDamageToVehicle(this.data.incomingDamage, this.actor)));
    }
    override get successLabel() {
        if (!this.actor) return "SR5.AttackDodged";

        if (CombatRules.attackMisses(this.against.hits.value, this.hits.value)) return "SR5.AttackDodged";

        if(CombatRules.doesNoPhysicalDamageToVehicle(this.data.incomingDamage, this.actor)) {
            return "SR5.AttackDoesNoPhysicalDamageToVehicle";
        }

        if(CombatRules.isBlockedByVehicleArmor(this.data.incomingDamage, this.against.hits.value, this.hits.value, this.actor)) {
            return "SR5.AttackBlockedByVehicleArmor";
        }

        return "SR5.AttackDodged";
    }

    override get failure() {
        return !this.success;
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

        this.data.modifiedDamage = CombatRules.modifyDamageAfterHit(this.actor, this.against.hits.value, this.hits.value, this.data.incomingDamage);

        await super.processFailure();
    }

    override async afterFailure() {
        const test = await TestCreator.fromOpposedTestResistTest(this, this.data.options);
        if (!test) return;
        await test.execute();
    }

    override canConsumeDocumentResources() {
        // Check if the actor is in active combat situation and has enough initiative score left.
        if (this.actor && this.data.iniMod && game.combat) {
            const combat: SR5Combat = game.combat as unknown as SR5Combat;
            const combatant = combat.getActorCombatant(this.actor);
            if (!combatant || !combatant.initiative) return true;
            
            if (combatant && combatant.initiative + this.data.iniMod < 0) {
                ui.notifications?.warn('SR5.MissingRessource.Initiative', {localize: true});
                return false;
            }
        }

        return super.canConsumeDocumentResources();
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

    override _prepareResultActionsTemplateData() {
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

    /**
     * Increase the actors multi defense modifier.
     */
    async applyActorEffectsForDefense() {
        if (!this.actor) return;

        this.actor.calculateNextDefenseMultiModifier();
    }

    /**
     * Based in combatants ini score, pre-filter available active defense modes.
     * 
     * This behaviour can be disabled using the must have ressources setting.
     */
    _filterActiveDefenses() {
        if (!this.actor) return;
        
        // Don't validate ini costs when costs are to be ignored.
        const mustHaveRessouces = game.settings.get(SYSTEM_NAME, FLAGS.MustHaveRessourcesOnTest);
        if (!mustHaveRessouces) return;

        // TODO: Check ressource setting.
        const iniScore = this.actor.combatInitiativeScore;
        Object.values(this.data.activeDefenses).forEach(mode => 
            mode.disabled = CombatRules.canUseActiveDefense(iniScore, mode.initMod)
        )
    }
}