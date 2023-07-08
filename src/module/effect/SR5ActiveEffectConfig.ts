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
        
        data.modes = this.injectModifyLabelOverCustomMode(data.modes);

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
    injectModifyLabelOverCustomMode(modes: Record<number, string>): Record<number, string> {
        return {...modes, 0: game.i18n.localize('SR5.ActiveEffect.Modes.Modify')};
    }
}