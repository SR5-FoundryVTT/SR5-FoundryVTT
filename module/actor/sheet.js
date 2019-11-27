import { SR5 } from '../config.js';
import { Helpers } from '../helpers.js';
/**
 * Extend the basic ActorSheet with some very simple modifications
 */
export class SR5ActorSheet extends ActorSheet {
  get data() {
    return this.actor.data.data;
  }

  constructor(...args) {
    super(...args);

    /**
     * Keep track of the currently active sheet tab
     * @type {string}
     */
    this._sheetTab = "skills";
  }

  /* -------------------------------------------- */

  /**
   * Extend and override the default options used by the 5e Actor Sheet
   * @returns {Object}
   */
	static get defaultOptions() {
	  return mergeObject(super.defaultOptions, {
  	  classes: ["sr5", "sheet", "actor"],
  	  template: "systems/shadowrun5e/templates/actor/character.html",
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
    const data = super.getData();

    // do some calculations
    const limits = data.data.limits;
    if (limits.physical.mod === 0) delete limits.physical.mod;
    if (limits.social.mod === 0) delete limits.social.mod;
    if (limits.mental.mod === 0) delete limits.mental.mod;
    const movement = data.data.movement;
    if (movement.walk.mult === 1 || movement.walk.mult === 0) delete movement.walk.mult;
    if (movement.run.mult === 2 || movement.run.mult === 0) delete movement.run.mult;
    const track = data.data.track;
    if (track.physical.mod === 0) delete track.physical.mod;
    if (track.stun && track.stun.mod === 0) delete track.stun.mod;

    this._prepareItems(data);
    this._prepareSkills(data);

    data.config = CONFIG.SR5;

    return data;
  }

  _prepareSkills(data) {
    for (const att of Object.values(data.data.attributes)) {
      if (att.skills) delete att.skills;
    }
    for (const skill of Object.values(data.data.skills.active)) {
      if (!data.data.attributes[skill.attribute].skills) {
        data.data.attributes[skill.attribute].skills = {};
      }
      const att = data.data.attributes[skill.attribute];
      att.skills[skill.label] = skill;
    }
  }

  _prepareItems(data) {
    const inventory = {
      weapon: {
        label: "Weapon",
        items: [],
        dataset: {
          type: 'weapon'
        }
      },
      device: {
        label: "Device",
        items: [],
        dataset: {
          type: 'device'
        }
      },
      equipment: {
        label: "Equipment",
        items: [],
        dataset: {
          type: 'equipment'
        }
      },
      cyberware: {
        label: "Cyberware",
        items: [],
        dataset: {
          type: 'cyberware'
        }
      }
    };
    const spellbook = {
      combat: {
        label: "Combat",
        items: [],
        dataset: {
          type: 'combat'
        }
      },
      detection: {
        label: "Detection",
        items: [],
        dataset: {
          type: 'detection'
        }
      },
      health: {
        label: "Health",
        items: [],
        dataset: {
          type: 'health'
        }
      },
      illusion: {
        label: "Illusion",
        items: [],
        dataset: {
          type: 'illusion'
        }
      },
      manipulation: {
        label: "Manipulation",
        items: [],
        dataset: {
          type: 'manipulation'
        }
      }
    };

    let [items, spells, qualities, adept_powers, critter_power] = data.items.reduce((arr, item) => {
      item.img = item.img || DEFAULT_TOKEN;
      item.isStack = item.data.quantity ? item.data.quantity > 1 : false;

      if (item.type === 'spell') arr[1].push(item);
      else if (item.type === 'quality') arr[2].push(item);
      else if (item.type === 'adept_power') arr[3].push(item);
      else if (item.type === 'critter_power') arr[4].push(item);
      else if (Object.keys(inventory).includes(item.type)) arr[0].push(item);
      return arr;
    }, [[], [], [], [], []]);

    items.forEach(item => {
      inventory[item.type].items.push(item);
    });
    spells.forEach(spell => {
      console.log(spell.data.category);
      spellbook[spell.data.category].items.push(spell);
    });

    data.inventory = Object.values(inventory);
    data.spellbook = Object.values(spellbook);
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

    html.find('.skill-header').click(event => {
      event.preventDefault();
      console.log(event);
      const field = $(event.currentTarget).siblings('.item');
      field.toggle();
      this._onSubmit(event);
    });

    html.find('.attribute-roll').click(this._onRollAttribute.bind(this));
    html.find('.skill-roll').click(this._onRollActiveSkill.bind(this));
    html.find('.defense-roll').click(this._onRollDefense.bind(this));
    html.find('.attribute-only-roll').click(this._onRollAttributesOnly.bind(this));
    html.find('.soak-roll').click(this._onRollSoak.bind(this));

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Update Inventory Item
    html.find('.item-edit').click(event => {
      const iid = parseInt(event.currentTarget.dataset.item);
      console.log(iid);
      console.log(this.actor.items);
      const item = this.actor.getOwnedItem(iid);
      console.log(item);
      item.sheet.render(true);
    });

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const iid = parseInt(event.currentTarget.dataset.item);
      const el = $(ev.currentTarget).parents(".item");
      this.actor.deleteOwnedItem(iid);
      el.slideUp(200, () => this.render(false));
    });
  }

  async _onRollDefense(event) {
    event.preventDefault();
    const defense = event.currentTarget.dataset.roll;
    this.actor.rollDefense(defense, {event: event});
  }

  async _onRollSoak(event) {
    event.preventDefault();
    const soak = event.currentTarget.dataset.soak;
    this.actor.rollSoak(soak, {event: event});
  }

  async _onRollAttributesOnly(event) {
    event.preventDefault();
    const roll = event.currentTarget.dataset.roll;
    this.actor.rollAttributesTest(roll, {event: event});
  }

  async _onRollActiveSkill(event) {
    event.preventDefault();
    const skill = event.currentTarget.dataset.skill;
    this.actor.rollActiveSkill(skill, {event: event});
  }

  async _onRollAttribute(event) {
    event.preventDefault();
    const attr = event.currentTarget.dataset.attribute;
    this.actor.rollAttribute(attr, {event: event});
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
