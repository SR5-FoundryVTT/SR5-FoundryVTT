//@ts-nocheck // This is copied FoundryVTT v12 code for Application v1 support. All of this should be removed once we do Application v2.
/* eslint-disable @typescript-eslint/await-thenable */
/* eslint-disable @typescript-eslint/return-await */

/**
 * The Application responsible for configuring a single ActiveEffect document within a parent Actor or Item.
 * @extends {DocumentSheet}
 *
 * @param {ActiveEffect} object             The target active effect being configured
 * @param {DocumentSheetOptions} [options]  Additional options which modify this application instance
 */
export class ActiveEffectConfigV1 extends DocumentSheet {

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["sheet", "active-effect-sheet"],
      template: "templates/sheets/active-effect-config.html",
      width: 580,
      height: "auto",
      tabs: [{navSelector: ".tabs", contentSelector: "form", initial: "details"}]
    });
  }

  /* ----------------------------------------- */

  /** @override */
  async getData(options={}): Promise<ActiveEffectConfig.Data>  {
    const context = await super.getData(options);
    context.descriptionHTML = await TextEditor.enrichHTML(this.object.description, {secrets: this.object.isOwner});
    const legacyTransfer = CONFIG.ActiveEffect.legacyTransferral;
    const labels = {
      transfer: {
        name: game.i18n.localize(`EFFECT.Transfer${legacyTransfer ? "Legacy" : ""}`),
        hint: game.i18n.localize(`EFFECT.TransferHint${legacyTransfer ? "Legacy" : ""}`)
      }
    };

    // Status Conditions
    const statuses = CONFIG.statusEffects.map(s => {
      return {
        id: s.id,
        label: game.i18n.localize(s.name ?? /** @deprecated since v12 */ s.label),
        selected: context.data.statuses.includes(s.id) ? "selected" : ""
      };
    });

    // Return rendering context
    return foundry.utils.mergeObject(context, {
      labels,
      effect: this.object, // Backwards compatibility
      data: this.object,
      isActorEffect: this.object.parent.documentName === "Actor",
      isItemEffect: this.object.parent.documentName === "Item",
      submitText: "EFFECT.Submit",
      statuses,
      modes: Object.entries(CONST.ACTIVE_EFFECT_MODES).reduce((obj, e) => {
        obj[e[1]] = game.i18n.localize(`EFFECT.MODE_${e[0]}`);
        return obj;
      }, {})
    });
  }

  /* ----------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    html.find(".effect-control").click(this._onEffectControl.bind(this));
  }

  /* ----------------------------------------- */

  /**
   * Provide centralized handling of mouse clicks on control buttons.
   * Delegate responsibility out to action-specific handlers depending on the button action.
   * @param {MouseEvent} event      The originating click event
   * @private
   */
  _onEffectControl(event) {
    event.preventDefault();
    const button = event.currentTarget;
    switch ( button.dataset.action ) {
      case "add":
        return this._addEffectChange();
      case "delete":
        button.closest(".effect-change").remove();
        return this.submit({preventClose: true}).then(() => this.render());
    }
  }

  /* ----------------------------------------- */

  /**
   * Handle adding a new change to the changes array.
   * @private
   */
  async _addEffectChange() {
    const idx = this.document.changes.length;
    return this.submit({preventClose: true, updateData: {
      [`changes.${idx}`]: {key: "", mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: ""}
    }});
  }

  /* ----------------------------------------- */

  /** @inheritdoc */
  _getSubmitData(updateData={}) {
    const fd = new FormDataExtended(this.form, {editors: this.editors});
    const data = foundry.utils.expandObject(fd.object);
    if ( updateData ) foundry.utils.mergeObject(data, updateData);
    data.changes = Array.from(Object.values(data.changes || {}));
    data.statuses ??= [];
    return data;
  }
}
