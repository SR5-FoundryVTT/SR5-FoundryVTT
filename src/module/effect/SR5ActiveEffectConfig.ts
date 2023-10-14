export class SR5ActiveEffectConfig extends ActiveEffectConfig {
    override get template(): string {
        return 'systems/shadowrun5e/dist/templates/effect/active-effect-config.html';
    }

    override async getData(options?: Application.RenderOptions) {
        const data = await super.getData(options) as any;
        data.modes = {...data.modes, 0: game.i18n.localize('SR5.ActiveEffect.Modes.Modify')};
        return data;
    }

    override activateListeners(html: JQuery<HTMLElement>): void {
        super.activateListeners(html);
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
    return this.submit({preventClose: true, updateData: {
      [`changes.${idx}`]: {key: "", mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, value: ""}
    }}) as unknown as this;
  }
}