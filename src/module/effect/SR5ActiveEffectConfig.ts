import { SR5 } from "../config";
import { SR5ActiveEffect } from "./SR5ActiveEffect";

/**
 * Shadowrun system alteres some behaviours of Active Effects, making a custom ActiveEffectConfig necessary.
 * 
 * NOTE: A ActiveEffectConfig class is comparable to a DocumentSheet class, but Foundry differentiates between
 * 'Config' and 'Sheet'.
 */
export class SR5ActiveEffectConfig extends ActiveEffectConfig {
    override get template(): string {
        return 'systems/shadowrun5e/dist/templates/effect/active-effect-config.html';
    }

    override async getData(options?: Application.RenderOptions): Promise<ActiveEffectConfig.Data> {
        const data = await super.getData(options) as any;
        
        data.modes = this.applyModifyLabelToCustomMode(data.modes);
        
        data.applyToOptions = this.prepareApplyToOptions();
        data.applyTo = this.document.applyTo;

        data.testKeyOptions = this.prepareKeyOptions();

        return data;
    }

    /**
     * Foundry provides a custom mode for systems to implement behaviour with.
     * 
     * Shadowrun uses this mode to implement 'modify' mode, with complex behaviour.
     * To give users better information about the mode, inject a 'modify' label.
     * 
     * @param modes A object prepared for display using Foundry select handlebarjs helper.
     * @returns Copy of the original modes and labels.
     */
    applyModifyLabelToCustomMode(modes: Record<number, string>): Record<number, string> {
        return {...modes, 0: game.i18n.localize('SR5.ActiveEffect.Modes.Modify')};
    }

    /**
     * Prepare apply to select options.
     */
    prepareApplyToOptions(): Record<string, string> {
        return SR5.effectApplyTo;
    }

    /**
     * Provide the Configh Sheet with a list of keys to choose from.
     * 
     * The list provided depends on the systems apply-to effect type.
     * 
     * @returns A object with a Foundry poroperty string as key and a i18n label as value.
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

    _prepareTestKeyOptions() {
        return {
            'system.modifiers': 'Pool Modifiers',
            'system.threshold': 'Threshold',
            'system.limit': 'Limit',
            'system.hits': 'Hits',
            'system.glitches': 'Glitches',
            'system.netHits': 'Net Hits'
        }
    }

    _prepareActorKeyOptions() {
        return {
            'system.attributes.body': 'SR5.AttrBody'
        }
    }

    _prepareModifierKeyOptions() {
        return {}
    }
}