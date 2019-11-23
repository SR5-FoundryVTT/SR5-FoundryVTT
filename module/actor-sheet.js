import { DiceSR } from './dice.js';

/**
 * Extend the basic ActorSheet with some very simple modifications
 */
export class Sr5CharacterActorSheet extends ActorSheet {
  get data() {
    return this.actor.data.data;
  }

  constructor(...args) {
    super(...args);

    /**
     * Keep track of the currently active sheet tab
     * @type {string}
     */
    this._sheetTab = "description";
  }

  /* -------------------------------------------- */

  /**
   * Extend and override the default options used by the 5e Actor Sheet
   * @returns {Object}
   */
	static get defaultOptions() {
	  return mergeObject(super.defaultOptions, {
  	  classes: ["sr5", "sheet", "actor"],
  	  template: "systems/shadowrun5e/templates/actor-sheet.html",
      width: 600,
      height: 600
    });
  }

  /* -------------------------------------------- */

  /**
   * Prepare data for rendering the Actor sheet
   * The prepared data object contains both the actor data as well as additional sheet options
   */
  getData() {
    const sheetData = super.getData();

    // do some calculations
    const attrs = sheetData.data.attributes;

    this._prepareLimits(sheetData.data.limits, attrs);
    this._prepareMonitors(sheetData.data.track, attrs);
    this._prepareMovement(sheetData.data.movement, attrs);

    return sheetData;
  }

  _prepareLimits(limits, attrs) {
    if (limits.physical.mod === 0) delete limits.physical.mod;
    if (limits.social.mod === 0) delete limits.social.mod;
    if (limits.mental.mod === 0) delete limits.mental.mod;
    limits.physical.value = Math.ceil(((2 * attrs.strength.value)
        + attrs.body.value
        + attrs.reaction.value) / 3)
        + (limits.physical.mod ? limits.physical.mod : 0);
    limits.mental.value = Math.ceil(((2 * attrs.logic.value)
      + attrs.intuition.value
      + attrs.willpower.value) / 3)
      + (limits.mental.mod ? limits.mental.mod : 0);
    limits.social.value = Math.ceil(((2 * attrs.charisma.value)
      + attrs.willpower.value
      + attrs.essence.value) / 3)
      + (limits.social.mod ? limits.social.mod : 0);
  }

  _prepareMovement(movement, attrs) {
    if (movement.walk.mult === 1 || movement.walk.mult === 0) delete movement.walk.mult;
    if (movement.run.mult === 2 || movement.run.mult === 0) delete movement.run.mult;

    movement.walk.value = attrs.agility.value
      * (movement.walk.mult ? movement.walk.mult : 1);
    movement.run.value = attrs.agility.value
      * (movement.run.mult ? movement.run.mult : 2);
  }

  _prepareMonitors(track, attrs) {
    if (track.physical.mod === 0) delete track.physical.mod;

    track.physical.max = 8 + Math.ceil(attrs.body.value / 2)
      + (track.physical.mod ? track.physical.mod : 0);
    track.physical.overflow = attrs.body;

    if (track.stun) {
      if (track.stun.mod === 0) delete track.stun.mod;
      track.stun.max = 8 + Math.ceil(attrs.willpower.value / 2)
        + (track.stun.mod ? track.stun.mod : 0);
    }
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

    html.find('.attribute-name').click(this._onRollAttribute.bind(this));
    html.find('.skill-name').click(this._onRollActiveSkill.bind(this));

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Update Inventory Item
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.getOwnedItem(li.data("itemId"));
      item.sheet.render(true);
    });

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      this.actor.deleteOwnedItem(li.data("itemId"));
      li.slideUp(200, () => this.render(false));
    });

    // Add or Remove Attribute
    // html.find(".attributes").on("click", ".attribute-control", this._onClickAttributeControl.bind(this));
  }

  async _onRollActiveSkill(event) {
    event.preventDefault();
    const skill = event.currentTarget.dataset.skill;
    this.rollActiveSkill(skill, {event: event});
  }

  async _onRollAttribute(event) {
    event.preventDefault();
    const attr = event.currentTarget.dataset.attribute;
    this.rollAttribute(attr, {event: event});
  }

  rollActiveSkill(skillId, options) {
    const skill = this.data.skills.active[skillId];
    const attr = this.data.attributes[skill.attribute];
    const limit = this.data.limits[skill.limit];
    return DiceSR.d6({
      event: options.event,
      actor: this.actor,
      count: skill.value + attr.value,
      limit: limit.value
    });
  }

  rollAttribute(attrId, options) {
    console.log(this.data);
    const attr = this.data.attributes[attrId];
    console.log(attr);
  }



  /* -------------------------------------------- */

  /**
   * Implement the _updateObject method as required by the parent class spec
   * This defines how to update the subject of the form when the form is submitted
   * @private
   */
  _updateObject(event, formData) {
    console.log(formData);
    // Update the Actor
    return this.object.update(formData);
  }
}
