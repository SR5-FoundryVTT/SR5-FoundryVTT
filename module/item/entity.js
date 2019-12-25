import { DiceSR } from '../dice.js';
import { Helpers } from '../helpers.js';

export class SR5Item extends Item {

  _previousFireMode = 1;

  get hasOpposedRoll() {
    return false;
    return !!(this.data.data.action && this.data.data.action.opposed.attributes.length);
  }

  get hasRoll() {
    return !!(this.data.data.action && this.data.data.action.attribute !== '');
  }

  prepareData() {
    super.prepareData();
    const labels = {};
    const item = this.data;

    if (item.type === 'weapon') {
      const action = item.data.action;
      if (typeof action.limit === 'number') action.limit = {value: action.limit};
      action.limit.mod = 0;
      action.damage.mod = 0;
      if (typeof action.damage.ap === 'number') action.damage.ap = {value: action.damage.ap};
      action.damage.ap.mod = 0;
      if (item.data.category === 'thrown') {
        action.skill = 'throwing_weapons';
      }
      action.attribute = CONFIG.SR5.attributes.AGILITY;
      if (item.data.range) {
        const range = item.data.range;
        if (typeof range.rc !== 'object') range.rc = {value: 0, base: 0, mod: 0};
        range.rc.mod = 0;
        if (!range.mods) range.mods = [];
        if (typeof range.mods === 'object') {
          range.mods = Object.values(range.mods);
        }
        range.mods.forEach(mod => {
          console.log(mod);
          if (mod.equipped) {
            if (mod.rc) range.rc.mod += mod.rc;
            if (mod.acc) action.limit.mod += mod.acc;
          }
        });
        if (range.ammo) {
          const ammo = range.ammo;
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

        range.rc.value = range.rc.base + range.rc.mod;
      }
    }

    if (item.type === 'spell') {
      item.data.action.attribute = 'magic';
      item.data.action.skill = 'spellcasting';
    }

    if (item.type === 'device') {
      item.data.condition_monitor.max = 8 + Math.ceil(item.data.technology.rating / 2);
    }

    if (item.data.action) {
      const action = item.data.action;
      if (action.damage) {
        action.damage.value = action.damage.base + action.damage.mod;
        if (action.damage.attribute && this.actor) action.damage.value += this.actor.data.data.attributes[action.damage.attribute].value;
        if (action.damage.ap) action.damage.ap.value = action.damage.ap.base + action.damage.ap.mod;
      }
      if (action.limit) action.limit.value = action.limit.base + action.limit.mod;
      console.log(action.limit);
    }

    this.labels = labels;
    console.log(item);
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

    data.description.value = enrichHTML(data.description.value, htmlOptions);

    const props = [];
    this[`_${this.data.type}ChatData`](data, labels, props);

    data.properties = props.filter(p => !!p);

    return data;
  }

  _actionChatData(data, labels, props) {
    props.push(Helpers.label(data.action.skill));
    props.push(Helpers.label(data.action.attribute));
    if (data.action.limit.attribute) props.push(Helpers.label(data.action.limit.attribute));
    labels['roll'] = 'Roll';
  }

  _armorChatData(data, labels, props) {
    props.push(`Armor ${data.armor.value}`);
    if (data.armor.mod) props.push('Accessory');
    if (data.armor.acid) props.push(`Acid ${data.armor.acid}`);
    if (data.armor.cold) props.push(`Cold ${data.armor.cold}`);
    if (data.armor.fire) props.push(`Fire ${data.armor.fire}`);
    if (data.armor.electricity) props.push(`Electricity ${data.armor.electricity}`);
    if (data.armor.radiation) props.push(`Radiation ${data.armor.radiation}`);
  }

  _spellChatData(data, labels, props) {
    if (data.category === 'combat') {
      props.push(Helpers.label(data.combat.type));
      props.push(Helpers.label(data.action.damage.element));
      props.push(Helpers.label(data.action.damage.type));
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
    props.unshift(Helpers.label(data.range),
                  Helpers.label(data.duration),
                  Helpers.label(data.type),
                  Helpers.label(data.category));
    labels['roll'] = 'Cast';
  }

  _weaponChatData(data, labels, props) {
    let dv = +data.action.damage.value;
    let acc = +data.action.limit.value;
    let ap = +data.action.damage.ap.value;
    let damageType = data.action.damage.type.toUpperCase().charAt(0);
    let element = Helpers.label(data.action.damage.element);
    if (data.category === 'range') {
      if (data.range.rc) props.push(`RC ${data.range.rc.value}`);
      const ammo = data.range.ammo;
      const curr = ammo.equipped;
      if (data.range.range) props.push(data.range.range);
      if (curr.name) props.push(` ${ammo.value}/${ammo.max} ${curr.name}`);
      if (curr.blast.radius) props.push(`${curr.blast.radius}m`);
      if (curr.blast.dropoff) props.push(`${curr.blast.dropoff}/m`);
      if (data.range.modes) props.push(data.range.modes);
    } else if (data.category === 'melee') {
      if (data.melee.reach !== '') props.push(`Reach ${data.melee.reach}`);
    } else if (data.category === 'thrown') {
      if (data.thrown.range !== '') props.push(data.thrown.range);
      const blast = data.thrown.blast;
      if (blast.value > 0) props.push(`Blast Radius ${blast.radius}`);
      if (blast.dropoff !== 0) props.push(`Blast Dropoff ${blast.dropoff}`);
    }
    if (element && element !== '') props.unshift(element);
    if (data.action.damage.attribute) dv += this.actor.data.data.attributes[data.action.damage.attribute].value;
    props.unshift(`DV ${dv}${damageType}`, `AP ${ap}`, `Acc ${acc}`);
    labels['roll'] = 'Attack';
    labels['opposedRoll'] = 'Defend';
  }

  _adept_powerChatData(data, labels, props) {
    props.push(`PP ${data.pp}`);
    props.push(Helpers.label(data.type));
    if (data.type === 'active') {
      props.push(`${Helpers.label(data.action.type)} Action`);
    }
    labels['roll'] = 'Roll';
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

  rollTest(ev) {
    const itemData = this.data.data;
    const actorData = this.actor.data.data;

    let skill = actorData.skills.active[itemData.action.skill];
    let attribute = actorData.attributes[itemData.action.attribute];
    let attribute2 = actorData.attributes[itemData.action.attribute2];
    let limit = parseInt(itemData.action.limit.value);
    let limit_att = itemData.action.limit.attribute;
    let spec = itemData.action.spec ? 2 : 0;
    let mod = parseInt(itemData.action.mod || 0);

    let count = skill.value + attribute.value + spec + mod;
    let title = `${Helpers.label(skill.label)} + ${Helpers.label(attribute.label)}`;

    if (this.data.type === 'weapon') {
      if (itemData.category === 'thrown') limit = actorData.limits.physical.value;
      if (itemData.category === 'range') {
        let fireMode = this._previousFireMode;
        let rc = parseInt(itemData.range.rc.value) + parseInt(actorData.recoil_compensation);
        let dialogData = {
          fireMode: fireMode,
          rc: rc,
          ammo: itemData.range.ammo
        };
        return renderTemplate('systems/shadowrun5e/templates/rolls/range-weapon-roll.html', dialogData).then(dlg => {
          const buttons = {};
          let ranges = itemData.range.range.split('/');
          let environmental = true;
          if (ranges.length !== 4) {
            ranges = ['','','',''];
          }
          buttons['short'] = {
            label: `Short (${ranges[0]})`
          };
          buttons['medium'] = {
            label: `Medium (${ranges[1]})`,
            callback: () => environmental = 1
          };
          buttons['long'] = {
            label: `Long (${ranges[2]})`,
            callback: () => environmental = 3
          };
          buttons['extreme'] = {
            label: `Extreme (${ranges[3]})`,
            callback: () => environmental = 6
          };
          new Dialog({
            title: title,
            content: dlg,
            buttons: buttons,
            close: (html) => {
              const fireMode = parseInt(html.find('[name="fireMode"]').val())
              title = this.data.name;
              if (fireMode) {
                title += ` - Defender (${Helpers.mapRoundsToDefenseMod(fireMode)})`
                this._previousFireMode = fireMode;
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
                after: () => {
                  const dupData = duplicate(this.data);
                  const ammo = dupData.data.range.ammo;
                  ammo.value = Math.max(0, ammo.value - fireMode);
                  this.update(dupData);
                }
              });
            }
          }).render(true);
        });
      } else {
        return DiceSR.d6({
          event: ev,
          count: count,
          actor: this.actor,
          limit: limit,
          title: title
        });
      }
    } else if (this.data.type === 'spell') {
      let dialogData = {
        drain: (itemData.drain >= 0 ? `+${itemData.drain}` : itemData.drain),
        force: 2 - itemData.drain
      };
      let reckless = false;
      renderTemplate('systems/shadowrun5e/templates/rolls/spell-roll.html', dialogData).then(dlg => {
        new Dialog({
          title: `${Helpers.label(this.data.name)} Force`,
          content: dlg,
          buttons: {
            roll: {
              label: 'Roll',
              icon: '<i class="fas fa-dice-six"></i>'
            },
            spec: {
              label: 'Reckless',
              icon: '<i class="fas fa-plus"></i>',
              callback: () => reckless = true
            }
          },
          close: (html) => {
            const force = parseInt(html.find('[name=force]').val());
            limit = force;
            DiceSR.d6({
              event: ev,
              count: count,
              actor: this.actor,
              limit: limit,
              title: `${this.data.name}`,
              after: () => {
                const drain = Math.max(itemData.drain + force + (reckless ? 3 : 0), 2);
                this.actor.rollDrain({event: ev}, drain);
              }
            });
          }
        }).render(true);
      });
    } else if (this.data.type === 'adept_power' || this.data.type === 'critter_power') {
      title = this.data.name;
      if (!limit || limit === 0) {
        limit = actorData.limits[attribute.limit].value;
      }
      if (this.data.data.action.category === 'att+att') {
        count = attribute.value + attribute2.value + spec + mod;
        limit = undefined;
      }
      return DiceSR.d6({
        event: ev,
        count: count,
        actor: this.actor,
        limit: limit,
        title: title
      });
    } else if (this.data.type === 'action') {
      title = this.data.name;
      if (limit_att) {
        limit = actorData.limits[limit_att].value;
      }
      return DiceSR.d6({
        event: ev,
        count: count,
        actor: this.actor,
        limit: limit,
        title: title
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

      if ( !game.user.isGM && (game.user._id !== senderId )) return;

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
      const itemId = Number(card.data('itemId'));
      const item = actor.getOwnedItem(itemId);

      const action = button.data('action');
      if (action === 'roll') item.rollTest(ev);

    });
    html.on('click', '.card-header', ev => {
      ev.preventDefault();
      $(ev.currentTarget).siblings('.card-content').toggle();
    });
    $(html).find('.card-content').hide();
  }
}
