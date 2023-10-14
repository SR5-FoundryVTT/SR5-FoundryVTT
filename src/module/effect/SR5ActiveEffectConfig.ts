import { SR5 } from "../config";
import { SR5ActiveEffect } from "./SR5ActiveEffect";

/**
 * Shadowrun system alters some behaviors of Active Effects, making a custom ActiveEffectConfig necessary.
 * 
 * NOTE: A ActiveEffectConfig class is comparable to a DocumentSheet class, but Foundry differentiates between
 * 'Config' and 'Sheet'.
 * 
 * The ActiveEffectConfig differs from other sheets in updating / submitting behavior due to changes needing a
 * multi step configuration process. If a change is partially configured it might break the underlying data structure 
 * and sheet rendering. To prevent this, the config sheet is rendered with a manually triggered 'submit' button.
 * 
 * The Shadowrun5e system uses ActiveEffects for more than only altering actor data.
 * Besides the default 'actor' apply-to type others are also supported, with all changes of an effect applying to that target only.
 * 
 * Some apply-to types follow the default key-value change structure of altering data, while others (modifiers) allow defining 
 * custom handlers to apply complex behaviors to targets.
 * 
 * Each apply-to target defines what effects are applicable to it and how changes are to be applied. These differing behaviors
 * are defined in <>EffectsFlow.ts or <>ChangeFlow.ts and follow the Foundry interface of 'apply' and 'allApplicableEffects' methods.
 * 
 * While actors apply effects as part of their prepareData flow the modifier apply-to target applies effects as part of the calculation of their
 * situational modifiers and others still can behave differently.
 */
export class SR5ActiveEffectConfig extends ActiveEffectConfig {
    override object: SR5ActiveEffect;

    override get template(): string {
        return 'systems/shadowrun5e/dist/templates/effect/active-effect-config.html';
    }

    override async getData(options?: Application.RenderOptions): Promise<ActiveEffectConfig.Data> {
        const data = await super.getData(options) as any;

        data.modes = this.applyModifyLabelToCustomMode(data.modes);

        data.applyTo = this.document.applyTo;
        data.onlyForWireless = this.document.onlyForWireless;

        data.applyToOptions = this.prepareApplyToOptions();
        data.testKeyOptions = this.prepareKeyOptions();
        data.hasChanges = this.prepareEffectHasChanges();

        return data;
    }

    override activateListeners(html: JQuery<HTMLElement>): void {
        super.activateListeners(html);

        html.find('select[name="flags.shadowrun5e.applyTo"]').on('change', this._onApplyToChange.bind(this));
    }

    /**
     * Handle adding a new change to the changes array.
     * 
     * This overrides the Foundry default behavior of using ADD as default.
     * Shadowrun mostly uses MODIFY, so we use that as default.
     * 
     * @private
     */
    override async _addEffectChange(): Promise<this> {
        //@ts-ignore TODO: foundry-vtt-types v10
        const idx = this.document.changes.length;
        return this.submit({
            preventClose: true, updateData: {
                [`changes.${idx}`]: { key: "", mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, value: "" }
            }
        }) as unknown as this;
    }

    /**
     * Assure both no changes are present before changing the applyTo type
     * and re-render the sheet to refresh prepared change value options.
     * 
     * This is to avoid configured changes breaking when changing to other applyTo types
     * that do not support the same change keys.
     */
    async _onApplyToChange(event: JQuery.ClickEvent) {
        event.preventDefault();

        const select = event.currentTarget as HTMLSelectElement;

        if (this.object.getFlag('shadowrun5e', 'applyTo') === select.value) return;

        if (this.object.changes.length) {
            ui.notifications?.error('You must delete changes before changing the apply-to type.');
        } else {
            await this.object.update({ 'flags.shadowrun5e.applyTo': select.value });
        }

        this.render();
    }

    /**
     * Foundry provides a custom mode for systems to implement behavior with.
     * 
     * Shadowrun uses this mode to implement 'modify' mode, with complex behavior.
     * To give users better information about the mode, inject a 'modify' label.
     * 
     * @param modes A object prepared for display using Foundry select handlebarjs helper.
     * @returns Copy of the original modes and labels.
     */
    applyModifyLabelToCustomMode(modes: Record<number, string>): Record<number, string> {
        return { ...modes, 0: game.i18n.localize('SR5.ActiveEffect.Modes.Modify') };
    }

    /**
     * Prepare apply to select options.
     */
    prepareApplyToOptions(): Record<string, string> {
        return SR5.effectApplyTo;
    }

    /**
     * Provide the config sheet with a list of change keys to choose from.
     * 
     * The list provided depends on the systems apply-to effect type.
     * 
     * @returns A object with a Foundry property string as key and a i18n label as value.
     */
    prepareKeyOptions(): Record<string, string> {
        switch (this.document.applyTo) {
            case 'actor':
            case 'targeted_actor':
                return this._prepareActorKeyOptions();
            case 'test_all':
            case 'test_item':
                return this._prepareTestKeyOptions();
            case 'modifier':
                return this._prepareModifierKeyOptions();
            default:
                return {};
        }
    }

    /**
     * Key options for test related applyTo selections.
     * 
     * @returns key - label object
     */
    _prepareTestKeyOptions() {
        return {
            'system.modifiers': 'SR5.DicePool',
            'system.threshold': 'SR5.Threshold',
            'system.limit': 'SR5.Limit',
            'system.hits': 'SR5.Hits',
            'system.glitches': 'SR5.Glitches',
            'system.netHits': 'SR5.NetHits'
        }
    }

    /**
     * TODO: These could be fetched using the data model FoundryVtt provides.
     */
    _prepareActorKeyOptions() {
        return {
            // Attributes
            'system.attributes.body': 'SR5.AttrAgility',
            'system.attributes.agility': 'SR5.AttrAgility',
            'system.attributes.attack': 'SR5.MatrixAttrAttack',
            'system.attributes.charisma': 'SR5.AttrCharisma',
            'system.attributes.data_processing': 'SR5.MatrixAttrDataProc',
            'system.attributes.edge': 'SR5.AttrEdge',
            'system.attributes.essence': 'SR5.AttrEssence',
            'system.attributes.firewall': 'SR5.MatrixAttrFirewall',
            'system.attributes.intuition': 'SR5.AttrIntuition',
            'system.attributes.logic': 'SR5.AttrLogic',
            'system.attributes.magic': 'SR5.AttrMagic',
            'system.attributes.reaction': 'SR5.AttrReaction',
            'system.attributes.resonance': 'SR5.AttrResonance',
            'system.attributes.sleaze': 'SR5.MatrixAttrSleaze',
            'system.attributes.strength': 'SR5.AttrStrength',
            'system.attributes.willpower': 'SR5.AttrWillpower',
            'system.attributes.pilot': 'SR5.Vehicle.Stats.Pilot',
            'system.attributes.force': 'SR5.Force',

            // Limits
            'system.limits.physical': 'SR5.LimitPhysical',
            'system.limits.social': 'SR5.LimitSocial',
            'system.limits.mental': 'SR5.LimitMental',
            'system.limits.astral': 'SR5.LimitAstral',

            // 
        }
    }

    /**
     * All key options related to the effect applyTo type 'modifier'.
     * 
     * @returns key : label object
     */
    _prepareModifierKeyOptions() {
        return {
            'environmental.low_light_vision': '',
            'environmental.image_magnification': '',
            'environmental.tracer_rounds': '',
            'environmental.smartlink': '',
            'environmental.ultrasound': ''
        }
    }

    /**
     * Determine if the effect has changes applied already.
     * 
     * This should be used to prohibit changing of applyTo selections.
     * @returns true if changes are present, false otherwise.
     */
    prepareEffectHasChanges(): boolean {
        return this.object.changes.length > 0;
    }



}