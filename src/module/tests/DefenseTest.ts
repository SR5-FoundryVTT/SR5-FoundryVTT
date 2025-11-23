import {OpposedTest, OpposedTestData} from "./OpposedTest";
import {DataDefaults} from "../data/DataDefaults";
import { Translation } from '../utils/strings';
import { DamageType } from "../types/item/Action";
import { SR5Combat } from "../combat/SR5Combat";
import { SYSTEM_NAME, FLAGS } from "../constants";
import { CombatRules } from "../rules/CombatRules";


export interface DefenseTestData extends OpposedTestData {
    // Damage value of the attack
    incomingDamage: DamageType
    // Modified damage value of the attack after this defense (success or failure)
    modifiedDamage: DamageType
    // Dialog input for active defense modifier
    activeDefense: string
    activeDefenses: Record<string, { label: Translation, value: number|undefined, initMod: number, weapon?: string, disabled?: boolean }>

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

        const damage = data.against ? data.against.damage : DataDefaults.createData('damage');

        data.incomingDamage = foundry.utils.duplicate(damage);
        data.modifiedDamage = foundry.utils.duplicate(damage);

        return data;
    }

    override get _chatMessageTemplate() {
        return 'systems/shadowrun5e/dist/templates/rolls/defense-test-message.hbs'
    }

    override get successLabel(): Translation {
        return 'SR5.TestResults.AttackDodged';
    }

    override get failureLabel(): Translation {
        return 'SR5.TestResults.AttackHits';
    }

    override get testCategories(): Shadowrun.ActionCategories[] {
        return ['defense'];
    }
    
    override calculateBaseValues() {
        super.calculateBaseValues();
        this.applyIniModFromActiveDefense();
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

    
    override canConsumeDocumentResources() {
        // Check if the actor is in active combat situation and has enough initiative score left.
        if (this.actor && this.data.iniMod && game.combat) {
            const combat: SR5Combat = game.combat as unknown as SR5Combat;
            const combatant = combat.getActorCombatant(this.actor);
            if (!combatant?.initiative) return true;

            if (combatant && combatant.initiative + this.data.iniMod < 0) {
                ui.notifications?.warn('SR5.MissingRessource.Initiative', {localize: true});
                return false;
            }
        }

        return super.canConsumeDocumentResources();
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
            { mode.disabled = CombatRules.canUseActiveDefense(iniScore, mode.initMod) }
        )
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
}
