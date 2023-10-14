export class SR5ActiveEffectConfig extends ActiveEffectConfig {
    override get template(): string {
        return 'systems/shadowrun5e/dist/templates/effect/active-effect-config.html';
    }

    override async getData(options?: Application.RenderOptions) {
        const data = await super.getData(options) as any;
        data.modes = {...data.modes, 0: game.i18n.localize('SR5.ActiveEffect.Modes.Modify')};
        return data;
    }
}