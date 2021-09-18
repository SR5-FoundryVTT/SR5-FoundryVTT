export class SR5ActiveEffectSheet extends ActiveEffectConfig {
    get template(): string {
        return 'systems/shadowrun5e/dist/templates/effect/active-effect-config.html';
    }

    getData(options?: Application.RenderOptions): Promise<ActiveEffectConfig.Data> | ActiveEffectConfig.Data {
        const data = super.getData(options);
        return data;
    }
}