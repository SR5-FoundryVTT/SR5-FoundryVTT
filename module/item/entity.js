import { DiceSR } from '../dice.js';
import { Helpers } from '../helpers.js';

export class SR5Item extends Item {

  get hasOpposedRoll() {
    return !!(this.data.data.action && this.data.data.action.opposed.type);
  }

  get hasRoll() {
    return !!(this.data.data.action && this.data.data.action.type !== '');
  }

  prepareData() {
    super.prepareData();
    const labels = {};
    const item = this.data;

    if (item.type === 'sin') {
      if (typeof item.data.licenses === 'object') {
        item.data.licenses = Object.values(item.data.licenses);
      }
    }

    if (item.data.action) {
      const action = item.data.action;
      action.alt_mod = 0;
      action.limit.mod = 0;
      action.damage.mod = 0;
      action.damage.ap.mod = 0;
      // setup range weapon special shit
      if (item.type !== 'spell' && item.data.range) {
        const range = item.data.range;
        range.rc.mod = 0;
        if (range.mods) {
          // turn object into array
          if (typeof range.mods === 'object') {
            range.mods = Object.values(range.mods);
          }
          range.mods.forEach(mod => {
            if (mod.equipped) {
              if (mod.rc) range.rc.mod += mod.rc;
              if (mod.acc) action.limit.mod += mod.acc;
              if (mod.dp) action.alt_mod += mod.dp;
            }
          });
        }
        if (range.ammo) {
          const ammo = range.ammo;
          // turn object into array
          if (typeof ammo.available === 'object') {
            ammo.available = Object.values(ammo.available);
          }
          if (ammo.available) {
            ammo.available.forEach(v => {
              if (v.equipped) {
                ammo.equipped = v;
                action.damage.mod += v.damage;
                action.damage.ap.mod += v.ap;
              }
            });
          }
        }
        if (range.rc) range.rc.value = range.rc.base + range.rc.mod;
      }

      // once all damage mods have been accounted for, sum base and mod to value
      action.damage.value = action.damage.base + action.damage.mod;
      action.damage.ap.value = action.damage.ap.base + action.damage.ap.mod;
      action.limit.value = action.limit.base + action.limit.mod;
      if (this.actor) {
        if (action.damage.attribute) action.damage.value += this.actor.data.data.attributes[action.damage.attribute].value;
        if (action.limit.attribute) action.limit.value += this.actor.data.data.limits[action.limit.attribute].value;
      }
    }

    if (item.data.condition_monitor) {
      item.data.condition_monitor.max = 8 + Math.ceil(item.data.technology.rating / 2);
    }

    this.labels = labels;
    item.properties = this.getChatData().properties;
  }

  async roll(event) {
    if (Helpers.hasModifiers(event)) {
      return this.rollTest(event);
    }
    const data = this.data.data;
    const token = this.actor.token;
    const templateData = {
      actor: this.actor,
      tokenId: token ? `${token.scene._id}.${token.id}` : null,
      item: this.data,
      type: this.data.type,
      data: this.getChatData(),
      hasRoll: this.hasRoll,
      hasOpposedRoll: this.hasOpposedRoll,
      labels: this.labels
    };

    const templateType = 'item';
    const template = `systems/shadowrun5e/templates/rolls/${templateType}-card.html`;
    const html = await renderTemplate(template, templateData);

    const chatData = {
      user: game.user._id,
      type: CONST.CHAT_MESSAGE_TYPES.OTHER,
      content: html,
      speaker: {
        actor: this.actor._id,
        token: this.actor.token,
        alias: this.actor.name
      }
    };

    const rollMode = game.settings.get('core', 'rollMode');
    if (['gmroll', 'blindroll'].includes(rollMode)) chatData['whisper'] = ChatMessage.getWhisperIDs('GM');
    if (rollMode === 'blindroll') chatData['blind'] = true;

    return ChatMessage.create(chatData, {displaySheet: false});
  }

  getChatData(htmlOptions) {
    const data = duplicate(this.data.data);
    const labels = this.labels;

    data.description.value = TextEditor.enrichHTML(data.description.value, htmlOptions);

    const props = [];
    this[`_${this.data.type}ChatData`](data, labels, props);

    data.properties = props.filter(p => !!p);

    return data;
  }

  _actionChatData(data, labels, props) {
    if (data.action.limit.value) props.push(`Limit ${data.action.limit.value}`);
    if (data.action.type) props.push(`${Helpers.label(data.action.type)} Action`);
    if (data.action.skill) {
      labels['roll'] = `${Helpers.label(data.action.skill)}+${Helpers.label(data.action.attribute)}`;
    } else if (data.action.attribute2) {
      labels['roll'] = `${Helpers.label(data.action.attribute)}+${Helpers.label(data.action.attribute2)}`;
    }
    if (data.action.damage.type) {
      const damage = data.action.damage;
      if (damage.value) props.push(`DV ${damage.value}${damage.type ? damage.type.toUpperCase().charAt(0) : ''}`);
      if (damage.ap && damage.ap.value) props.push(`AP ${damage.ap.value}`);
      if (damage.element) props.push(Helpers.label(damage.element));
    }
    if (data.action.opposed.type) {
      const opposed = data.action.opposed;
      if (opposed.type !== 'custom') labels['opposedRoll'] = `vs. ${Helpers.label(opposed.type)}`;
      else if (opposed.skill) labels['opposedRoll'] = `vs. ${Helpers.label(opposed.skill)}+${Helpers.label(opposed.attribute)}`;
      else if (opposed.attribute2) labels['opposedRoll'] = `vs. ${Helpers.label(opposed.attribute)}+${Helpers.label(opposed.attribute2)}`;
      else if (opposed.attribute) labels['opposedRoll'] = `vs. ${Helpers.label(opposed.attribute)}`;
      if (opposed.description) props.push(`Opposed Desc: ${opposed.desc}`);
    }
  }

  _sinChatData(data, labels, props) {
    props.push(`Rating ${data.technology.rating}`);
    console.log(data);
    data.licenses.forEach(license => {
      props.push(`${license.name} R${license.rtg}`);
    });
  }

  _contactChatData(data, labels, props) {
    props.push(data.type);
    props.push(`Connection ${data.connection}`);
    props.push(`Loyalty ${data.loyalty}`);
  }

  _lifestyleChatData(data, labels, props) {
    props.push(Helpers.label(data.type));
    if (data.cost) props.push(`¥${data.cost}`);
    if (data.comforts) props.push(`Comforts ${data.comforts}`);
    if (data.security) props.push(`Security ${data.security}`);
    if (data.neighborhood) props.push(`Neighborhood ${data.neighborhood}`);
    if (data.guests) props.push(`Guests ${data.guests}`);
  }

  _adept_powerChatData(data, labels, props) {
    this._actionChatData(data, labels, props);
    props.push(`PP ${data.pp}`);
    props.push(Helpers.label(data.type));
    if (data.type === 'active') {
      props.push(`${Helpers.label(data.action.type)} Action`);
    }
  }

  _armorChatData(data, labels, props) {
    if (data.armor) {
      if (data.armor.value) props.push(`Armor ${data.armor.value}`);
      if (data.armor.mod) props.push('Accessory');
      if (data.armor.acid) props.push(`Acid ${data.armor.acid}`);
      if (data.armor.cold) props.push(`Cold ${data.armor.cold}`);
      if (data.armor.fire) props.push(`Fire ${data.armor.fire}`);
      if (data.armor.electricity) props.push(`Electricity ${data.armor.electricity}`);
      if (data.armor.radiation) props.push(`Radiation ${data.armor.radiation}`);
    }
  }

  _complex_formChatData(data, labels, props) {
    this._actionChatData(data, labels, props);
    props.push(Helpers.label(data.target),
                Helpers.label(data.duration))
    let fade = data.fade;
    if (fade > 0) props.push(`Fade L+${fade}`);
    else if(fade < 0) props.push(`Fade L${fade}`);
    else props.push('Fade L');
  }

  _cyberwareChatData(data, labels, props) {
    if (data.essence) props.push(`Ess ${data.essence}`);
  }

  _deviceChatData(data, labels, props) {
    if (data.technology && data.technology.rating) props.push(`Rating ${data.technology.rating}`);
    if (data.category === 'cyberdeck') {
      for (let attN of Object.values(data.atts)) {
        props.push(`${Helpers.label(attN.att)} ${attN.value}`);
      }
    }
  }

  _equipmentChatData(data, labels, props) {
    if (data.technology && data.technology.rating) props.push(`Rating ${data.technology.rating}`);
  }

  _qualityChatData(data, labels, props) {
    props.push(Helpers.label(data.type));
  }

  _spellChatData(data, labels, props) {
    this._actionChatData(data, labels, props);
    props.push(Helpers.label(data.range),
                Helpers.label(data.duration),
                Helpers.label(data.type),
                Helpers.label(data.category));
    let drain = data.drain;
    if (drain > 0) props.push(`Drain F+${drain}`);
    else if(drain < 0) props.push(`Drain F${drain}`);
    else props.push('Drain F');

    if (data.category === 'combat') {
      props.push(Helpers.label(data.combat.type));
    } else if (data.category === 'health') {

    } else if (data.category === 'illusion') {
      props.push(data.illusion.type);
      props.push(data.illusion.sense);
    } else if (data.category === 'manipulation') {
      if (data.manipulation.damaging) props.push('Damaging');
      if (data.manipulation.mental) props.push( 'Mental');
      if (data.manipulation.environmental) props.push('Environmental');
      if (data.manipulation.physical) props.push( 'Physical');
    } else if (data.category === 'detection') {
      props.push(data.illusion.passive ? 'Passive' : 'Active');
      props.push(data.illusion.type);
      if (data.illusion.extended) props.push('Extended');
    }
    labels['roll'] = 'Cast';
  }

  _weaponChatData(data, labels, props) {
    this._actionChatData(data, labels, props);

    if (data.category === 'range') {
      if (data.range.rc) props.push(`RC ${data.range.rc.value}`);
      const ammo = data.range.ammo;
      const curr = ammo.equipped;
      if (curr.name) props.push(`${curr.name}(${ammo.value}/${ammo.max})`);
      if (curr.blast.radius) props.push(`${curr.blast.radius}m`);
      if (curr.blast.dropoff) props.push(`${curr.blast.dropoff}/m`);
      if (data.range.modes) props.push(Array.from(Object.entries(data.range.modes))
          .filter(([key, val]) => val && !key.includes('-'))
            .map(([key, val]) => Helpers.label(key)).join('/'));
      if (data.range.ranges) props.push(Array.from(Object.values(data.range.ranges)).join('/'));
    } else if (data.category === 'melee') {
      if (data.melee.reach) props.push(`Reach ${data.melee.reach}`);
    } else if (data.category === 'thrown') {
      if (data.thrown.ranges) {
        const mult = data.thrown.ranges.attribute && this.actor ? this.actor.data.data.attributes[data.thrown.ranges.attribute].value : 1;
        const ranges = [data.thrown.ranges.short, data.thrown.ranges.medium, data.thrown.ranges.long, data.thrown.ranges.extreme];
        props.push(ranges.map(v => v * mult).join('/'));
      };
      const blast = data.thrown.blast;
      if (blast.value) props.push(`Radius ${blast.radius}m`);
      if (blast.dropoff) props.push(`Dropoff ${blast.dropoff}/m`);
    }
  }

  addWeaponMod() {
    const data = duplicate(this.data);
    const range = data.data.range;
    if (typeof range.mods === 'object') {
      range.mods = Object.values(range.mods);
    }
    range.mods.push({
      equipped: false,
      name: '',
      dp: 0,
      acc: 0,
      rc: 0,
      desc: ''
    });
    this.update(data);
  }

  equipWeaponMod(index) {
    const data = duplicate(this.data);
    const mods = data.data.range.mods;
    mods[index].equipped = !mods[index].equipped;
    this.update(data);
  }

  removeWeaponMod(index) {
    const data = duplicate(this.data);
    const mods = data.data.range.mods;
    mods.splice(index, 1);
    this.update(data);
  }

  reloadAmmo() {
    const data = duplicate(this.data);
    const ammo = data.data.range.ammo;
    ammo.available.forEach(v => {
      if (v.equipped) v.qty = Math.max(0, v.qty - (ammo.max - ammo.value));
    });
    ammo.value = ammo.max;
    this.update(data);
  }

  equipAmmo(index) {
    const data = duplicate(this.data);
    const ammo = data.data.range.ammo;
    ammo.available.forEach((v, i) => {
      v.equipped = (i === index);
    });
    this.update(data);
  }

  removeAmmo(index) {
    const data = duplicate(this.data);
    const ammo = data.data.range.ammo;
    ammo.available.splice(index, 1);
    this.update(data);
  }

  addNewLicense() {
    const data = duplicate(this.data);
    let licenses = data.data.licenses;
    if (typeof licenses === 'object') {
      data.data.licenses = Object.values(licenses);
    }
    data.data.licenses.push({
      name: '',
      rtg: '',
      description: ''
    });
    this.update(data);
  }

  removeLicense(index) {
    const data = duplicate(this.data);
    const licenses = data.data.licenses;
    licenses.splice(index, 1);
    this.update(data);
  }

  addNewAmmo() {
    const data = duplicate(this.data);
    const ammo = data.data.range.ammo;
    if (typeof ammo.available === 'object') {
      ammo.available = Object.values(ammo.available);
    }
    ammo.available.push({
      equipped: false,
      name: '',
      damage: 0,
      ap: 0,
      blast: {
        radius: 0,
        dropoff: 0
      }
    });
    this.update(data);
  }

  rollOpposedTest(target, ev) {
    const itemData = this.data.data;
    let options = {event: ev};

    if (this.getFlag('shadowrun5e', 'attack')) {
      options.incomingAttack = this.getFlag('shadowrun5e', 'attack');
      if (options.incomingAttack.fireMode) options.fireModeDefense = Helpers.mapRoundsToDefenseMod(options.incomingAttack.fireMode);
      options.cover = true;
    }

    options.incomingAction = this.getFlag('shadowrun5e', 'action');

    const opposed = itemData.action.opposed;
    if (opposed.type === 'defense') target.rollDefense(options);
    else if (opposed.type === 'soak') target.rollSoak(options);
    else if (opposed.type === 'armor') target.rollSoak(options);
    else {
      if (opposed.skill && opposed.attribute) target.rollSkill(opposed.skill, {...options, attribute: opposed.attribute});
      if (opposed.attribute && opposed.attribute2) target.rollTwoAttributes([opposed.attribute, opposed.attribute2], options);
      else if (opposed.attribute) target.rollSingleAttribute(opposed.attribute, options);
    }
  }

  rollTest(ev) {
    const itemData = this.data.data;
    const actorData = this.actor.data.data;

    let skill = actorData.skills.active[itemData.action.skill];
    let attribute = actorData.attributes[itemData.action.attribute];
    let attribute2 = actorData.attributes[itemData.action.attribute2];
    let limit = itemData.action.limit.value;
    let spec = itemData.action.spec ? 2 : 0;
    let mod = parseInt(itemData.action.mod || 0) + parseInt(itemData.action.alt_mod || 0);

    // only check if attribute2 is set if skill is not set
    let count = 0;
    if (skill) count = skill.value + attribute.value;
    else if (attribute2) count = attribute.value + attribute2.value;
    else if (attribute) count = attribute.value;
    count += spec + mod;

    let title = this.data.name;

    if (this.data.type === 'weapon' && itemData.category === 'range') {
      let attack = this.getFlag('shadowrun5e', 'attack') || {fireMode: 0};
      let fireMode = attack.fireMode;
      let rc = parseInt(itemData.range.rc.value) + parseInt(actorData.recoil_compensation);
      let dialogData = {
        dice_pool: count,
        fireMode: fireMode,
        rc: rc,
        ammo: itemData.range.ammo
      };
      return renderTemplate('systems/shadowrun5e/templates/rolls/range-weapon-roll.html', dialogData).then(dlg => {
        const buttons = {};
        let ranges = itemData.range.ranges;
        let environmental = true;
        let cancel = true;
        buttons['short'] = {
          label: `Short (${ranges.short})`,
          callback: () => cancel = false
        };
        buttons['medium'] = {
          label: `Medium (${ranges.medium})`,
          callback: () => { environmental = 1; cancel = false; }
        };
        buttons['long'] = {
          label: `Long (${ranges.long})`,
          callback: () => { environmental = 3; cancel = false; }
        };
        buttons['extreme'] = {
          label: `Extreme (${ranges.extreme})`,
          callback: () => { environmental = 6; cancel = false; }
        };
        new Dialog({
          title: title,
          content: dlg,
          buttons: buttons,
          close: (html) => {
            if (cancel) return;

            const fireMode = parseInt(html.find('[name="fireMode"]').val())
            if (fireMode) {
              title += ` - Defender (${Helpers.mapRoundsToDefenseDesc(fireMode)})`
            }
            if (fireMode > rc) count -= (fireMode - rc);
            DiceSR.d6({
              event: ev,
              count: count,
              actor: this.actor,
              limit: limit,
              title: title,
              dialogOptions: {
                environmental: environmental
              },
              after: async (roll) => {
                const dupData = duplicate(this.data);
                const ammo = dupData.data.range.ammo;
                let ammoValue = Math.max(0, ammo.value - fireMode);
                await this.update({"data.range.ammo.value": ammoValue});
                this.setFlag('shadowrun5e', 'attack', {
                  hits: roll.total,
                  fireMode: fireMode,
                  damageType: dupData.data.action.damage.type,
                  element: dupData.data.action.damage.element,
                  damage: dupData.data.action.damage.value,
                  ap: dupData.data.action.damage.ap.value
                });
              }
            });
          }
        }).render(true);
      });
    } else if (this.data.type === 'spell') {
      let dialogData = {
        drain: (itemData.drain >= 0 ? `+${itemData.drain}` : itemData.drain),
        force: 2 - itemData.drain
      };
      let reckless = false;
      let cancel = false;
      renderTemplate('systems/shadowrun5e/templates/rolls/roll-spell.html', dialogData).then(dlg => {
        new Dialog({
          title: `${Helpers.label(this.data.name)} Force`,
          content: dlg,
          buttons: {
            roll: {
              label: 'Normal',
              icon: '<i class="fas fa-dice-six"></i>',
              callback: () => cancel = false
            },
            spec: {
              label: 'Reckless',
              icon: '<i class="fas fa-plus"></i>',
              callback: () => { reckless = true; cancel = false; }
            }
          },
          close: (html) => {
            if (cancel) return;
            const force = parseInt(html.find('[name=force]').val());
            console.log(force);
            limit = force;
            DiceSR.d6({
              event: ev,
              environmental: true,
              count: count,
              actor: this.actor,
              limit: limit,
              title: title,
              after: async (roll) => {
                if (this.data.data.category === 'combat') {
                  let damage = force;
                  let ap = -force;
                  this.setFlag('shadowrun5e', 'attack', {
                    hits: roll.total,
                    damageType: this.data.data.action.damage.type,
                    element: this.data.data.action.damage.element,
                    damage: damage,
                    ap: ap
                  });
                }
                const drain = Math.max(itemData.drain + force + (reckless ? 3 : 0), 2);
                this.actor.rollDrain({event: ev}, drain);
              }
            });
          }
        }).render(true);
      });
    } else if (this.data.type === 'complex_form') {
      let dialogData = {
        fade: (itemData.fade >= 0 ? `+${itemData.fade}` : itemData.fade),
        level: 2 - itemData.fade
      };
      let cancel = true;
      renderTemplate('systems/shadowrun5e/templates/rolls/roll-complex-form.html', dialogData).then(dlg => {
        new Dialog({
          title: `${Helpers.label(this.data.name)} Level`,
          content: dlg,
          buttons: {
            roll: {
              label: 'Continue',
              icon: '<i class="fas fa-dice-six"></i>',
              callback: () => cancel = false
            }
          },
          close: (html) => {
            if (cancel) return;
            const level = parseInt(html.find('[name=level]').val());
            limit = level;
            DiceSR.d6({
              event: ev,
              environmental: true,
              count: count,
              actor: this.actor,
              limit: limit,
              title: title,
              after: (roll) => {
                const fade = Math.max(itemData.fade + level, 2);
                this.actor.rollFade({event: ev}, fade);
              }
            });
          }
        }).render(true);
      });
    } else {
      return DiceSR.d6({
        event: ev,
        count: count,
        environmental: true,
        actor: this.actor,
        limit: limit,
        title: title,
        after: async (roll) => {
          this.setFlag('shadowrun5e', 'action', {
            hits: roll.total
          });
        }
      });
    }
  }

  static chatListeners(html) {
    html.on('click', '.card-buttons button', ev => {
      ev.preventDefault();
      const button = $(ev.currentTarget),
            messageId = button.parents('.message').data('messageId'),
            senderId = game.messages.get(messageId).user._id,
            card = button.parents('.chat-card');
      button.disabled = true;
      const action = button.data('action');

      let opposedRoll = action === 'opposed-roll';
      if (!opposedRoll && !game.user.isGM && (game.user._id !== senderId )) return;

      let actor;
      const tokenKey = card.data('tokenId');
      if (tokenKey) {
        const [sceneId, tokenId] = tokenKey.split('.');
        let token;
        if (sceneId === canvas.scene._id) token = canvas.tokens.get(tokenId);
        else {
          const scene = game.scenes.get(sceneId);
          if (!scene) return;
          let tokenData = scene.data.tokens.find(t => t.id === Number(tokenId));
          if (tokenData) token = new Token(tokenData);
        }
        if (!token) return;
        actor = Actor.fromToken(token);
      } else actor = game.actors.get(card.data('actorId'));

      if (!actor) return;
      const itemId = card.data('itemId');
      const item = actor.getOwnedItem(itemId);

      if (action === 'roll') item.rollTest(ev);
      if (opposedRoll) {
        let targets = this._getChatCardTargets(card);
        for (let t of targets) {
          item.rollOpposedTest(t, ev);
        }
      }

      button.disabled = false;
    });
    html.on('click', '.card-header', ev => {
      ev.preventDefault();
      $(ev.currentTarget).siblings('.card-content').toggle();
    });
    $(html).find('.card-content').hide();
  }

 static _getChatCardTargets(card) {
    const character = game.user.character;
    const controlled = canvas.tokens.controlled;
    const targets = controlled.reduce((arr, t) => t.actor ? arr.concat([t.actor]) : arr, []);
    if ( character && (controlled.length === 0) ) targets.push(character);
    if ( !targets.length ) throw new Error(`You must designate a specific Token as the roll target`);
    return targets;
  }
}
