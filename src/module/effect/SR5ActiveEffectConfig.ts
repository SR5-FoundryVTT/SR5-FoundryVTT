export class SR5ActiveEffectConfig extends ActiveEffectConfig {
    get template(): string {
        return 'systems/shadowrun5e/dist/templates/effect/active-effect-config.html';
    }

    getData(options?: Application.RenderOptions): Promise<ActiveEffectConfig.Data> | ActiveEffectConfig.Data {
        const data = super.getData(options) as any;
        data.modes = {...data.modes, 0: game.i18n.localize('SR5.ActiveEffect.Modes.Modify')};
        return data;
    }
}