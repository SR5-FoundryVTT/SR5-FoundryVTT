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
          width: 520,
          height: 370,
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

    // const tech = data.data.technology;
    // if (tech.rating === 0) delete tech.rating;
    // if (tech.quantity === 0) delete tech.quantity;
    // if (tech.cost === 0) delete tech.cost;

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
  }
}
