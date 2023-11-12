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
        data.onlyForEquipped = this.document.onlyForEquipped;

        data.applyToOptions = this.prepareApplyToOptions();
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
     * Determine if the effect has changes applied already.
     * 
     * This should be used to prohibit changing of applyTo selections.
     * @returns true if changes are present, false otherwise.
     */
    prepareEffectHasChanges(): boolean {
        return this.object.changes.length > 0;
    }
}