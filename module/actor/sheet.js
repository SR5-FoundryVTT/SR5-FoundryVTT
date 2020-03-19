import { SR5 } from '../config.js';
import { Helpers } from '../helpers.js';
import { ChummerImportForm } from '../apps/chummer-import-form.js';
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
    this._shownUntrainedSkills = [];
    this._shownDesc = [];
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
      width: 800,
      height: 690
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

    const attrs = data.data.attributes;
    for (let [label, att] of Object.entries(attrs)) {
      if (!att.hidden) {
        if (att.mod === 0) delete att.mod;
      }
    }

    const matrix = data.data.matrix;
    if (matrix.attack.mod === 0) delete matrix.attack.mod;
    if (matrix.sleaze.mod === 0) delete matrix.sleaze.mod;
    if (matrix.data_processing.mod === 0) delete matrix.data_processing.mod;
    if (matrix.firewall.mod === 0) delete matrix.firewall.mod;

    const magic = data.data.magic;
    if (magic.drain && magic.drain.mod === 0) delete magic.drain.mod;

    const mods = data.data.modifiers;
    for (let [key, value] of Object.entries(mods)) {
      if (value === 0) mods[key] = "";
    }

    this._prepareItems(data);
    this._prepareSkills(data);

    data.config = CONFIG.SR5;
    data.awakened = data.data.special === 'magic';
    data.emerged = data.data.special === 'resonance';

    return data;
  }

  _prepareSkills(data) {
    let remove = [];
    for (let [key, skill] of Object.entries(data.data.skills.active)) {
      skill.css = skill.value > 0 ? '' : 'hidden';
      if (key === 'magic' && data.data.special !== 'magic') remove.push(key);
      if (key === 'resonance' && data.data.special !== 'resonance') remove.push(key);
    }
    remove.forEach(key => delete data.data.skills.active[key]);
    Helpers.orderKeys(data.data.skills.active);
  }

  _prepareItems(data) {
    const inventory = {
      weapon: {
        label: game.i18n.localize("weapon"),
        items: [],
        dataset: {
          type: 'weapon'
        }
      },
      armor: {
        label: game.i18n.localize("armor"),
        items: [],
        dataset: {
          type: 'armor'
        }
      },
      device: {
        label: game.i18n.localize("device"),
        items: [],
        dataset: {
          type: 'device'
        }
      },
      equipment: {
        label: game.i18n.localize("equipment"),
        items: [],
        dataset: {
          type: 'equipment'
        }
      },
      cyberware: {
        label: game.i18n.localize("cyberware"),
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

    let [items, spells, qualities, adept_powers, critter_powers, actions, complex_forms, lifestyles, contacts, sins] = data.items.reduce((arr, item) => {
      item.img = item.img || DEFAULT_TOKEN;
      item.isStack = item.data.quantity ? item.data.quantity > 1 : false;
      if (item.type === 'spell') arr[1].push(item);
      else if (item.type === 'quality') arr[2].push(item);
      else if (item.type === 'adept_power') arr[3].push(item);
      else if (item.type === 'critter_power') arr[4].push(item);
      else if (item.type === 'action') arr[5].push(item);
      else if (item.type === 'complex_form') arr[6].push(item);
      else if (item.type === 'lifestyle') arr[7].push(item);
      else if (item.type === 'contact') arr[8].push(item);
      else if (item.type === 'sin') arr[9].push(item);
      else if (Object.keys(inventory).includes(item.type)) arr[0].push(item);
      return arr;
    }, [[], [], [], [], [], [], [], [], [], []]);

    const sortByName = (i1, i2) => {
      if (i1.name > i2.name) return 1;
      if (i1.name < i2.name) return -1;
      return 0;
    };
    actions.sort(sortByName);
    adept_powers.sort(sortByName);
    complex_forms.sort(sortByName);
    items.sort(sortByName);
    spells.sort(sortByName);
    complex_forms.sort(sortByName);
    contacts.sort(sortByName);
    lifestyles.sort(sortByName);
    sins.sort(sortByName)

    items.forEach(item => {
      inventory[item.type].items.push(item);
    });

    data.inventory = Object.values(inventory);
    data.magic = {
      spellbook: spells,
      powers: adept_powers
    };
    data.actions = actions;
    data.complex_forms = complex_forms;
    data.lifestyles = lifestyles;
    data.contacts = contacts;
    data.sins = sins;

    qualities.sort((a, b) => {
      if (a.data.type === 'positive' && b.data.type === 'negative') return -1;
      if (a.data.type === 'negative' && b.data.type === 'positive') return 1;
      return a.name < b.name ? -1 : 1;
    })
    data.qualities = qualities;
  }

  /* -------------------------------------------- */

  /**
   * Activate event listeners using the prepared sheet HTML
   * @param html {HTML}   The prepared HTML object ready to be rendered into the DOM
   */
  activateListeners(html) {
    super.activateListeners(html);

    // Activate tabs
    let tabs = html.find('.tabs').filter('nav[data-group=primary]');
    let initial = this._sheetTab;
    new Tabs(tabs, {
      initial: initial,
      callback: clicked => this._sheetTab = clicked.data("tab")
    });

    html.find('.hidden').hide();
    this._shownUntrainedSkills.forEach(cat => {
      const field = $(`[data-category='${cat}']`);
      field.siblings('.item.hidden').show();
    });

    html.find('.skill-header').click(event => {
      event.preventDefault();
      const category = event.currentTarget.dataset.category;
      let field = $(event.currentTarget).siblings('.item.hidden');
      if (field.length === 0) {
        field = $(event.currentTarget).siblings('.scroll-area').find('.item.hidden');
      }
      field.toggle();
      if (field.is(':visible')) this._shownUntrainedSkills.push(category);
      else this._shownUntrainedSkills = this._shownUntrainedSkills.filter(val => val !== category);
    });

    html.find('.has-desc').click(event => {
      event.preventDefault();
      const item = $(event.currentTarget).parents('.item');
      const iid = $(item).data().item;
      const field = item.next();
      field.toggle();
      if (iid) {
        if (field.is(':visible')) this._shownDesc.push(iid);
        else this._shownDesc = this._shownDesc.filter(val => val !== iid);
      }
    });

    html.find('.attribute-roll').click(this._onRollAttribute.bind(this));
    html.find('.skill-roll').click(this._onRollActiveSkill.bind(this));
    html.find('.defense-roll').click(this._onRollDefense.bind(this));
    html.find('.attribute-only-roll').click(this._onRollAttributesOnly.bind(this));
    html.find('.soak-roll').click(this._onRollSoak.bind(this));
    html.find('.drain-roll').click(this._onRollDrain.bind(this));
    html.find('.fade-roll').click(this._onRollFade.bind(this));
    html.find('.item-roll').click(this._onRollItem.bind(this));
    html.find('.item-equip-toggle').click(this._onEquipItem.bind(this));
    html.find('.item-qty').change(this._onChangeQty.bind(this));
    html.find('.item-rtg').change(this._onChangeRtg.bind(this));
    html.find('.item-create').click(this._onItemCreate.bind(this));
    html.find('.matrix-roll').click(this._onRollMatrixAttribute.bind(this));
    html.find('.basic-roll').click(this._onRollPrompt.bind(this));
    html.find('.armor-roll').click(this._onRollArmor.bind(this));
    html.find('.add-knowledge').click(this._onAddKnowledgeSkill.bind(this));
    html.find('.knowledge-skill').click(this._onRollKnowledgeSkill.bind(this));
    html.find('.remove-knowledge').click(this._onRemoveKnowledgeSkill.bind(this));
    html.find('.add-language').click(this._onAddLanguageSkill.bind(this));
    html.find('.language-skill').click(this._onRollLanguageSkill.bind(this));
    html.find('.remove-language').click(this._onRemoveLanguageSkill.bind(this));
    html.find('.import-character').click(this._onShowImportCharacter.bind(this));
    html.find('.reload-ammo').click(this._onReloadAmmo.bind(this));
    html.find('.matrix-att-selector').change(event => {
      let iid = this.data.matrix.device;
      let item = this.actor.getOwnedItem(iid);
      if (!item) console.error('could not find item');
      // grab matrix attribute (sleaze, attack, etc.)
      let att = event.currentTarget.dataset.att;
      // grab device attribute (att1, att2, ...)
      let deviceAtt = event.currentTarget.value;

      // get current matrix attribute on the device
      let oldVal = item.data.data.atts[deviceAtt].att;
      let data = {
        _id: iid
      };

      // go through atts on device, setup matrix attributes on it
      for (let i = 1; i <= 4; i++) {
        let tmp = `att${i}`;
        let key = `data.atts.att${i}.att`
        if (tmp === deviceAtt) {
          data[key] = att;
        } else if (item.data.data.atts[`att${i}`].att === att) {
          data[key] = oldVal;
        }
      }
      // update twice so that it triggers the correct values for the sheet
      this.actor.updateEmbeddedEntity('OwnedItem', data).then(() => {
        item.update({});
      });
    });

    // Update Inventory Item
    html.find('.item-edit').click(event => {
      event.preventDefault();
      const iid = event.currentTarget.closest('.item').dataset.itemId;
      const item = this.actor.getOwnedItem(iid);
      item.sheet.render(true);
    });
    // Delete Inventory Item
    html.find('.item-delete').click(event => {
      event.preventDefault();
      const iid = event.currentTarget.closest('.item').dataset.itemId;
      const el = $(event.currentTarget).parents(".item");
      this.actor.deleteOwnedItem(iid);
      el.slideUp(200, () => this.render(false));
    });
    // Drag inventory item
    let handler = ev => this._onDragItemStart(ev);
    html.find('.item').each((i, item) => {
      if (item.dataset && item.dataset.itemId) {
        item.setAttribute('draggable', true);
        item.addEventListener('dragstart', handler, false);
      }
    });
  }

  async _onReloadAmmo(event) {
    event.preventDefault();
    const iid = event.currentTarget.closest('.item').dataset.itemId;
    const item = this.actor.getOwnedItem(iid);
    if (item) item.reloadAmmo();
  }

  _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    const type = header.dataset.type;
    const itemData = {
      name: `New ${Helpers.label(type)}`,
      type: type,
      data: duplicate(header.dataset)
    };
    delete itemData.data['type'];
    return this.actor.createOwnedItem(itemData);
  }

  async _onAddLanguageSkill(event) {
    event.preventDefault();
    const data = duplicate(this.actor.data);
    data.data.skills.language.value.push({name: '', specs: '', rating: 0});
    this.actor.update(data);
  }

  async _onRemoveLanguageSkill(event) {
    event.preventDefault();
    const skillId = event.currentTarget.dataset.skill;
    const data = duplicate(this.actor.data);
    data.data.skills.language.value.splice(skillId, 1);
    this.actor.update(data);
  }

  async _onAddKnowledgeSkill(event) {
    event.preventDefault();
    const category = event.currentTarget.dataset.category;
    const data = duplicate(this.actor.data);
    const cat = data.data.skills.knowledge[category];
    if (cat) cat.value.push({name: '', specs: '', rating: 0});
    this.actor.update(data);
  }

  async _onRemoveKnowledgeSkill(event) {
    event.preventDefault();
    const skillId = event.currentTarget.dataset.skill;
    const category = event.currentTarget.dataset.category;
    const data = duplicate(this.actor.data);
    const cat = data.data.skills.knowledge[category];
    if (cat) cat.value.splice(skillId, 1);
    this.actor.update(data);
  }

  async _onChangeRtg(event) {
    const iid = event.currentTarget.closest('.item').dataset.itemId;
    const item = this.actor.getOwnedItem(iid);
    const rtg = parseInt(event.currentTarget.value);
    if (item && rtg) {
      item.update({"data.technology.rating": rtg});
    }
  }

  async _onChangeQty(event) {
    const iid = event.currentTarget.closest('.item').dataset.itemId;
    const item = this.actor.getOwnedItem(iid);
    const qty = parseInt(event.currentTarget.value);
    if (item && qty) {
      item.data.data.technology.quantity = qty;
      item.update({"data.technology.quantity": qty});
    }
  }

  async _onEquipItem(event) {
    event.preventDefault();
    const iid = event.currentTarget.closest('.item').dataset.itemId;
    const item = this.actor.getOwnedItem(iid);
    if (item) {
      const itemData = item.data.data;
      // if we will be equipping and it is a device
      if (!itemData.technology.equipped && item.type === 'device') {
        for (let ite of this.actor.items) {
          if (ite.type === 'device') {
            await ite.update({"data.technology.equipped": false});
          };
        }
      }
      await item.update({"data.technology.equipped": !itemData.technology.equipped});
    }
  }

  async _onRollPrompt(event) {
    event.preventDefault();
    this.actor.promptRoll({event: event});
  }

  async _onRollItem(event) {
    event.preventDefault();
    const iid = event.currentTarget.closest('.item').dataset.itemId;
    const item = this.actor.getOwnedItem(iid);
    item.roll(event);
  }

  async _onRollFade(event) {
    event.preventDefault();
    this.actor.rollFade({event: event});
  }

  async _onRollDrain(event) {
    event.preventDefault();
    this.actor.rollDrain({event: event});
  }

  async _onRollArmor(event) {
    event.preventDefault();
    this.actor.rollArmor({event: event});
  }

  async _onRollDefense(event) {
    event.preventDefault();
    this.actor.rollDefense({event: event});
  }

  async _onRollMatrixAttribute(event) {
    event.preventDefault();
    const attr = event.currentTarget.dataset.attribute;
    this.actor.rollMatrixAttribute(attr, {event: event});
  }

  async _onRollSoak(event) {
    event.preventDefault();
    this.actor.rollSoak({event: event});
  }

  async _onRollAttributesOnly(event) {
    event.preventDefault();
    const roll = event.currentTarget.dataset.roll;
    this.actor.rollAttributesTest(roll, {event: event});
  }

  async _onRollKnowledgeSkill(event) {
    event.preventDefault();
    const skill = event.currentTarget.dataset.skill;
    const category = event.currentTarget.dataset.category;
    this.actor.rollKnowledgeSkill(category, skill, {event: event});
  }

  async _onRollLanguageSkill(event) {
    event.preventDefault();
    const skill = event.currentTarget.dataset.skill;
    this.actor.rollLanguageSkill(skill, {event: event});
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

  /**
   * @private
   */
  _findActiveList () {
    return this.element.find('.tab.active .scroll-area');
  }

  /**
   * @private
   */
  async _render (force = false, options = {}) {
    this._saveScrollPositions();
    await super._render(force, options);
    this._restoreScrollPositions();
  }

  /**
   * @private
   */
  _restoreScrollPositions () {
    const activeList = this._findActiveList();
    if (activeList.length && this._scroll != null) {
      activeList.prop('scrollTop', this._scroll);
    }
  }

  /**
   * @private
   */
  _saveScrollPositions () {
    const activeList = this._findActiveList();
    if (activeList.length) {
      this._scroll = activeList.prop('scrollTop');
    }
  }

  /* -------------------------------------------- */

  /**
   * Implement the _updateObject method as required by the parent class spec
   * This defines how to update the subject of the form when the form is submitted
   * @private
   */
  _updateObject(event, formData) {
    // Update the Actor
    return this.object.update(formData);
  }

  _onShowImportCharacter(event) {
    event.preventDefault();
    const options = {
      name: 'chummer-import',
      title: 'Chummer Import'
    };
    new ChummerImportForm(this.actor, options).render(true);
  }
}
