import {OpposedTest, OpposedTestData} from "./OpposedTest";
import { DeepPartial } from "fvtt-types/utils";
import { TestOptions } from "./SuccessTest";
import {DataDefaults} from "../data/DataDefaults";
import { ModifiableValue } from "../mods/ModifiableValue";
import { Translation } from '../utils/strings';
import { DamageType } from "../types/item/Action";
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

    override _prepareData(data: DeepPartial<T>, options?: Partial<TestOptions>): T {
        const prepared = super._prepareData(data, options);

        const damage = prepared.against ? prepared.against.damage : DataDefaults.createData('damage');

        prepared.incomingDamage = foundry.utils.duplicate(damage) as DamageType;
        prepared.modifiedDamage = foundry.utils.duplicate(damage) as DamageType;

        return prepared;
    }

    override get _chatMessageTemplate() {
        return 'systems/shadowrun5e/dist/templates/rolls/success-test-message.hbs'
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

    override prepareBaseValues() {
        super.prepareBaseValues();
        this.applyOngoingFullDefense();
    }

    /**
     * Full Defense lasts the whole Combat Turn. SR5#191.
     *
     * Physical and matrix defenses go on Full Defense separately.
     */
    get fullDefenseKind(): 'physical' | 'matrix' {
        return this.hasTestCategory('matrix') ? 'matrix' : 'physical';
    }

    /**
     * The Full Defense the defender is on this Combat Turn, if any.
     */
    get ongoingFullDefense(): { kind: string, value: number } | undefined {
        for (const effect of this.actor?.effects ?? []) {
            if (effect.disabled || effect.isSuppressed || effect.duration?.expired) continue;
            const fullDefense = foundry.utils.getProperty(effect.flags, `${SYSTEM_NAME}.${FLAGS.FullDefense}`) as { kind: string, value: number } | undefined;
            if (fullDefense?.kind === this.fullDefenseKind) return fullDefense;
        }
        return undefined;
    }

    /**
     * Keep the Full Defense bonus for every defense of the Combat Turn, without paying for it again.
     * It stacks with other active defenses, like Dodge. SR5#191.
     */
    applyOngoingFullDefense() {
        const ongoing = this.ongoingFullDefense;
        if (!ongoing) return;

        delete this.data.activeDefenses.full_defense;
        if (this.data.activeDefense === 'full_defense') this.data.activeDefense = '';
        ModifiableValue.setUnique(this.data.pool, 'SR5.FullDefense', ongoing.value);
    }

    /**
     * Going on Full Defense during combat keeps the defender on it until the end of the Combat Turn.
     */
    async startFullDefense() {
        if (!this.actor || this.data.activeDefense !== 'full_defense') return;
        if (this.ongoingFullDefense) return;
        if (!game.combat?.started || !game.combat.getActorCombatant(this.actor)) return;

        const value = this.data.activeDefenses.full_defense?.value ?? 0;
        await this.actor.createEmbeddedDocuments('ActiveEffect', [{
            name: game.i18n.localize('SR5.FullDefense'),
            img: 'icons/svg/shield.svg',
            duration: { value: 1, units: 'rounds', expiry: 'roundEnd' },
            flags: { [SYSTEM_NAME]: { [FLAGS.FullDefense]: { kind: this.fullDefenseKind, value } } },
            system: { targets: [], changes: [] },
        } as unknown as ActiveEffect.CreateData]);
    }

    override async afterTestComplete() {
        await this.startFullDefense();
        await super.afterTestComplete();
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
            const combatant = game.combat.getActorCombatant(this.actor);
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

    get activeDefenseOptions(): { value: string, label: string, disabled: boolean }[] {
        return Object.entries(this.data.activeDefenses).map(([value, mode]) => {
            const label = `(+${mode.value ?? 0}) ${game.i18n.localize(mode.label)}${mode.weapon ? ` - ${mode.weapon}` : ''}`;

            return {
                value,
                label,
                disabled: !!mode.disabled
            };
        });
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
            label: 'SR5.InitiativeMod',
            value: String(activeDefense.initMod)
        });

        return actions;
    }
}
