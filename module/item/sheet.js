import { SR5 } from '../config.js';
/**
 * Extend the basic ItemSheet with some very simple modifications
 */
export class SR5ItemSheet extends ItemSheet {
  constructor(...args) {
    super(...args);

    this._sheetTab = null;
  }

  /**
   * Extend and override the default options used by the Simple Item Sheet
   * @returns {Object}
   */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
          classes: ["sr5", "sheet", "item"],
          width: 660,
          height: 400,
      });
  }

  get template() {
    const path = 'systems/shadowrun5e/templates/item/';
    return `${path}${this.item.data.type}.html`;
  }

  /* -------------------------------------------- */

  /**
   * Prepare data for rendering the Item sheet
   * The prepared data object contains both the actor data as well as additional sheet options
   */
  getData() {
    const data = super.getData();
    if (data.data.action && (data.data.action.mod === 0 || data.data.action.mod === "0")) delete data.data.action.mod;

    data.config = CONFIG.SR5;
    return data;
  }

  /* -------------------------------------------- */

  /**
   * Activate event listeners using the prepared sheet HTML
   * @param html {HTML}   The prepared HTML object ready to be rendered into the DOM
   */
	activateListeners(html) {
    super.activateListeners(html);

    // Activate tabs
    let tabs = html.find('.tabs');
    let initial = this._sheetTab;
    new Tabs(tabs, {
      initial: initial,
      callback: clicked => this._sheetTab = clicked.data("tab")
    });
  }
}
