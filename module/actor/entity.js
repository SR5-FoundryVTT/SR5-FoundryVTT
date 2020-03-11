import { DiceSR } from '../dice.js';
import { Helpers } from '../helpers.js';
import { SR5 } from '../config.js';

export class SR5Actor extends Actor {

  prepareData() {
    super.prepareData();

    const actorData = this.data;
    const items = actorData.items;
    const data = actorData.data;
    const attrs = data.attributes;
    const armor = data.armor;
    const limits = data.limits;

    attrs.magic.hidden = !(data.special === 'magic');
    attrs.resonance.hidden = !(data.special === 'resonance');

    if (!data.modifiers) data.modifiers = {};
    const mods = {};
    let modifiers = [
      'soak',
      'drain',
      'armor',
      'physical_limit',
      'social_limit',
      'mental_limit',
      'stun_track',
      'physical_track',
      'initiative',
      'initiative_dice',
      'composure',
      'lift_carry',
      'judge_intentions',
      'memory',
      'walk',
      'run',
      'defense',
      'wound_tolerance',
      'essence',
      'fade'
    ];
    modifiers.sort();
    modifiers.unshift('global');

    for (let item of modifiers) {
      mods[item] = data.modifiers[item] || 0;
    }

    data.modifiers = mods;

    let totalEssence = 6;
    armor.value = 0;
    armor.mod = 0;
    const ELEMENTS = ['acid', 'cold', 'fire', 'electricity', 'radiation'];
    ELEMENTS.forEach(element => {
      armor[element] = 0;
    });

    // DEFAULT MATRIX ATTS TO MOD VALUE
    const matrix = data.matrix;
    matrix.firewall.value = matrix.firewall.mod;
    matrix.data_processing.value = matrix.data_processing.mod;
    matrix.attack.value = matrix.attack.mod;
    matrix.sleaze.value = matrix.sleaze.mod;
    matrix.condition_monitor.max = 0;
    matrix.rating = 0;
    matrix.name = "";
    matrix.device = "";

    // PARSE WEAPONS AND SET VALUES AS NEEDED
    for (let item of Object.values(items)) {
      if (item.data.armor
        && item.data.armor.value
        && item.data.technology.equipped) {

        if (item.data.armor.mod) armor.mod += item.data.armor.value; // if it's a mod, add to the mod field
        else armor.value = item.data.armor.value; // if not a mod, set armor.value to the items value
        ELEMENTS.forEach(element => {
          armor[element] += item.data.armor[element];
        });
      }
      // MODIFIES ESSENCE
      if (item.data.essence && item.data.technology && item.data.technology.equipped) {
        totalEssence -= item.data.essence;
      }
      // MODIFIES MATRIX ATTRIBUTES
      if (item.type === 'device' && item.data.technology.equipped) {

        matrix.device = item.id;
        matrix.condition_monitor.max = item.data.condition_monitor.max;
        matrix.rating = item.data.technology.rating;
        matrix.is_cyberdeck = item.category === 'cyberdeck';
        matrix.name = item.name;

        if (item.data.category === 'cyberdeck') {
          for (let att of Object.values(item.data.atts)) {
            matrix[att.att].value += att.value;
          }
        } else {
          matrix.firewall.value += matrix.rating;
          matrix.data_processing.value += matrix.rating;
        }
      }
    }

    // ATTRIBUTES
    for (let [label, att] of Object.entries(attrs)) {
      if (!att.hidden) {
        if (!att.mod) att.mod = 0;
        att.value = att.base + att.mod;
      }
    }

    const knowledgeSkills = data.skills.knowledge;
    for (let [key, category] of Object.entries(knowledgeSkills)) {
      if (typeof category.value === 'object') {
        category.value = Object.values(category.value);
      }
    }
    const language = data.skills.language;
    if (language) {
      if (!language.value) language.value = [];
      if (typeof language.value === 'object') {
        language.value = Object.values(language.value);
      }
      language.attribute = 'intution';
    }
    for (let [label, skill] of Object.entries(data.skills.active)) {
      if (!skill.hidden) {
        if (!skill.mod) skill.mod = 0;
        skill.value = skill.base + skill.mod;
      }
    }
    for (let skill of data.skills.language.value) {
      if (!skill.mod) skill.mod = 0;
      skill.value = skill.base + skill.mod;
    }
    for (let group of Object.values(data.skills.knowledge)) {
      for (let skill of group.value) {
        if (!skill.mod) skill.mod = 0;
        skill.value = skill.base + skill.mod;
      }
    }

    // TECHNOMANCER LIVING PERSONA
    if (data.special === 'resonance') {
      if (matrix.firewall.value === matrix.firewall.mod) {
        // we should use living persona
        matrix.firewall.value += attrs.willpower.value;
        matrix.data_processing.value += attrs.logic.value;
        matrix.rating = attrs.resonance.value;
        matrix.attack.value += attrs.charisma.value;
        matrix.sleaze.value += attrs.intuition.value;
        matrix.name = "Living Persona";
        matrix.device = "";
        matrix.condition_monitor.max = 0;
      }
    }

    // set matrix condition monitor to max if greater than
    if (matrix.condition_monitor.value > matrix.condition_monitor.max) matrix.condition_monitor.value = matrix.condition_monitor.max;

    // ADD MATRIX ATTS TO LIMITS
    limits.firewall = {
      value: matrix.firewall.value,
      hidden: true
    };
    limits.data_processing = {
      value: matrix.data_processing.value,
      hidden: true
    };
    limits.attack = {
      value: matrix.attack.value,
      hidden: true
    };
    limits.sleaze = {
      value: matrix.sleaze.value,
      hidden: true
    };

    attrs.firewall = {
      value: matrix.firewall.value,
      hidden: true
    };
    attrs.data_processing = {
      value: matrix.data_processing.value,
      hidden: true
    };
    attrs.attack = {
      value: matrix.attack.value,
      hidden: true
    };
    attrs.sleaze = {
      value: matrix.sleaze.value,
      hidden: true
    };

    // SET ARMOR
    armor.value += armor.mod + mods.armor;

    // SET ESSENCE
    actorData.data.attributes.essence.value = +(totalEssence + mods.essence).toFixed(3);

    // SETUP LIMITS
    limits.physical.value = Math.ceil(((2 * attrs.strength.value)
        + attrs.body.value
        + attrs.reaction.value) / 3)
        + mods.physical_limit;
    limits.mental.value = Math.ceil(((2 * attrs.logic.value)
      + attrs.intuition.value
      + attrs.willpower.value) / 3)
      + mods.mental_limit;
    limits.social.value = Math.ceil(((2 * attrs.charisma.value)
      + attrs.willpower.value
      + attrs.essence.value) / 3)
      + mods.social_limit;

    // MOVEMENT
    const movement = data.movement;
    movement.walk.value = attrs.agility.value
      * (2 + mods.walk);
    movement.run.value = attrs.agility.value
      * (4 + mods.run);

    // CONDITION_MONITORS
    const track = data.track;
    track.physical.max = 8 + Math.ceil(attrs.body.value / 2)
      + mods.physical_track;
    track.physical.overflow = attrs.body;
    track.stun.max = 8 + Math.ceil(attrs.willpower.value / 2)
      + mods.stun_track;

    // CALCULATE RECOIL
    data.recoil_compensation = 1 + Math.ceil(attrs.strength.value / 3);

    // INITIATIVE
    const init = data.initiative;
    init.meatspace.base.base = attrs.intuition.value + attrs.reaction.value;
    init.meatspace.dice.base = 1;
    init.astral.base.base = attrs.intuition.value * 2;
    init.astral.dice.base = 2;
    init.matrix.base.base = attrs.intuition.value + data.matrix.data_processing.value;
    init.matrix.dice.base = data.matrix.hot_sim ? 4 : 3;
    if (init.perception === 'matrix') init.current = init.matrix;
    else if (init.perception === 'astral') init.current = init.astral;
    else {
      init.current = init.meatspace;
      init.perception = 'meatspace';
    }
    // only apply dice mods if in meatspace (RAW)
    init.current.dice.value = init.current.dice.base + (init.perception === 'meatspace' ? mods.initiative_dice : 0);
    if (init.edge) init.current.dice.value = 5;
    init.current.dice.value = Math.min(5, init.current.dice.value); // maximum of 5d6 for initiative
    init.current.dice.text = `${init.current.dice.value}d6`;
    init.current.base.value = init.current.base.base + mods.initiative;


    const soak = attrs.body.value + armor.value + mods.soak;
    const drainAtt = attrs[data.magic.attribute];
    data.rolls = {
      ...data.rolls,
      defense: attrs.reaction.value + attrs.intuition.value + mods.defense,
      drain: attrs.willpower.value + (drainAtt ? drainAtt.value : 0) + mods.drain,
      fade: attrs.willpower.value + attrs.resonance.value + mods.fade,
      soak: {
        default: soak,
        cold: soak + armor.cold,
        fire: soak + armor.fire,
        acid: soak + armor.acid,
        electricity: soak + armor.electricity,
        radiation: soak + armor.radiation
      },
      composure: attrs.charisma.value + attrs.willpower.value + mods.composure,
      judge_intentions: attrs.charisma.value + attrs.intuition.value + mods.judge_intentions,
      lift_carry: attrs.strength.value + attrs.body.value + mods.lift_carry,
      memory: attrs.willpower.value + attrs.logic.value + mods.memory
    }


    {
      const count = 3 + mods.wound_tolerance;
      const stunWounds = Math.floor((data.track.stun.max - data.track.stun.value) / count);
      const physicalWounds = Math.floor((data.track.physical.max - data.track.physical.value) / count);

      data.wounds = {
        value: stunWounds + physicalWounds
      }
    }

    // limit labels
    for (let [l, limit] of Object.entries(data.limits)) {
      limit.label = CONFIG.SR5.limits[l];
    }
    // skill labels
    for (let [s, skill] of Object.entries(data.skills.active)) {
      skill.label = CONFIG.SR5.activeSkills[s];
    }
    // attribute labels
    for (let [a, att] of Object.entries(data.attributes)) {
      att.label = CONFIG.SR5.attributes[a];
    }
    // tracks
    for (let [t, track] of Object.entries(data.track)) {
      track.label = CONFIG.SR5.damageTypes[t];
    }

    console.log(data);
  }

  rollFade(options, incoming = -1) {
    const resist = this.data.data.rolls.fade;
    let title = "Fade";
    if (incoming >= 0) title += ` (${incoming} incoming)`;
    DiceSR.d6({
      event: options.event,
      count: resist,
      actor: this,
      title: title,
      wounds: false
    });
  }

  rollDrain(options, incoming = -1) {
    const resist = this.data.data.rolls.drain;
    let title = 'Drain';
    if (incoming >= 0) title += ` (${incoming} incoming)`;
    DiceSR.d6({
      event: options.event,
      count: resist,
      actor: this,
      title: title,
      wounds: false
    });
  }

  rollArmor(options) {
    const armor = this.data.data.armor.value;
    return DiceSR.d6({
      event: options.event,
      actor: this,
      count: armor,
      title: 'Armor'
    });
  }

  rollDefense(options) {
    let dialogData = {
      defense: this.data.data.rolls.defense,
      fireMode: options.fireModeDefense,
      cover: options.cover
    };
    let template = 'systems/shadowrun5e/templates/rolls/roll-defense.html';
    let special = '';
    let cancel = true;
    return new Promise(resolve => {
      renderTemplate(template, dialogData).then(dlg => {
        new Dialog({
          title: "Defense",
          content: dlg,
          buttons: {
            normal: {
              label: 'Normal',
              callback: () => cancel = false
            },
            full_defense: {
              label: `Full Defense (+ ${this.data.data.attributes.willpower.value})`,
              callback: () => { special = 'full_defense';cancel = false; }
            }
          },
          default: 'normal',
          close: html => {
            if (cancel) return;
            let count = parseInt(html.find('[name=defense]').val());
            let fireMode = parseInt(html.find('[name=fireMode]').val());
            let cover = parseInt(html.find('[name=cover]').val());
            if (special === 'full_defense') count += this.data.data.attributes.willpower.value;
            if (special === 'dodge') count += this.data.data.skills.active.gymnastics.value;
            if (special === 'block') count += this.data.data.skills.active.unarmed_combat.value;
            if (fireMode) count += fireMode;
            if (cover) count += cover;
            return DiceSR.d6({
              event: options.event,
              actor: this,
              count: count,
              title: 'Defense',
              after: async (roll) => {
                this.unsetFlag('shadowrun5e', 'incomingAttack');
                if (options.incomingAttack) {
                  let defenderHits = roll.total;
                  let attack = options.incomingAttack;
                  let attackerHits = attack.hits || 0;
                  let netHits = attackerHits - defenderHits;
                  if (netHits >= 0) {
                    let damage = options.incomingAttack.damage + netHits;
                    let damageType = options.incomingAttack.damageType || '';
                    let ap = options.incomingAttack.ap;
                    // ui.notifications.info(`Got Hit: DV${damage}${damageType ? damageType.charAt(0).toUpperCase() : ''} ${ap}AP`);
                    this.setFlag('shadowrun5e', 'incomingDamage', {
                      damage: damage,
                      ap: ap
                    });
                    this.rollSoak({event, damage, ap});
                  }
                }
              }
            });
          }
        }).render(true);
      });
    });
  }

  rollSoak(options) {
    let dialogData = {
      damage: options.damage,
      ap: options.ap,
      soak: this.data.data.rolls.soak.default
    };
    let id = '';
    let cancel = true;
    let template = 'systems/shadowrun5e/templates/rolls/roll-soak.html';
    return new Promise(resolve => {
      renderTemplate(template, dialogData).then(dlg => {
        new Dialog({
          title: 'Soak Test',
          content: dlg,
          buttons: {
            base: {
              label: 'Base',
              icon: '<i class="fas fa-shield-alt"></i>',
              callback: () => { id = 'default'; cancel = false; }
            },
            acid: {
              label: 'Acid',
              icon: '<i class="fas fa-vial"></i>',
              callback: () => { id = 'acid'; cancel = false; }
            },
            cold: {
              label: 'Cold',
              icon: '<i class="fas fa-snowflake"></i>',
              callback: () => { id = 'cold'; cancel = false; }
            },
            electricity: {
              label: 'Elec',
              icon: '<i class="fas fa-bolt"></i>',
              callback: () => { id = 'electricity'; cancel = false; }
            },
            fire: {
              label: 'Fire',
              icon: '<i class="fas fa-fire"></i>',
              callback: () => { id = 'fire'; cancel = false; }
            },
            radiation: {
              label: 'Rad',
              icon: '<i class="fas fa-radiation"></i>',
              callback: () => { id = 'radiation'; cancel = false; }
            }
          },
          close: async (html) => {
            this.unsetFlag('shadowrun5e', 'incomingDamage');
            if (cancel) return;
            const soak = this.data.data.rolls.soak[id];
            let count = soak;
            const ap = parseInt(html.find('[name=ap]').val());
            if (ap) {
              const armorId = id === 'default' ? '' : id;
              const armor = this.data.data.armor;
              let armorVal = armor.value + (armor[armorId] || 0);
              count += Math.max(ap, -armorVal); // don't take more AP than armor
            }

            const label = Helpers.label(id);
            let title = `Soak - ${label}`;
            if (options.damage) title += ` - Incoming Damage: ${options.damage}`;
            return DiceSR.d6({
              event: options.event,
              actor: this,
              count: count,
              title: title,
              wounds: false
            });
          }
        }).render(true);
      });
    });
  }

  rollSingleAttribute(attId, options) {
    const attr = this.data.data.attributes[attId];
    return DiceSR.d6({
      event: options.event,
      actor: this,
      count: attr.value,
      title: Helpers.label(attrId),
      matrix: Helpers.isMatrix(attr)
    });
  }

  rollTwoAttributes([id1, id2], options) {
    const attr1 = this.data.data.attributes[id1];
    const attr2 = this.data.data.attributes[id2];
    const label1 = Helpers.label(id1);
    const label2 = Helpers.label(id2);
    return DiceSR.d6({
      event: options.event,
      actor: this,
      count: attr1.value + attr2.value,
      title: `${label1} + ${label2}`,
      matrix: Helpers.isMatrix([attr1, attr2])
    });
  }

  rollMatrixAttribute(attr, options) {
    let matrix_att = this.data.data.matrix[attr];
    let title = game.i18n.localize(CONFIG.SR5.matrixAttributes[attr]);

    if (Helpers.hasModifiers(options.event)) {
      return DiceSR.d6({
        event: options.event,
        actor: this,
        count: matrix_att.value + (options.event[SR5.kbmod.SPEC] ? 2 : 0),
        limit: limit ? limit.value : undefined,
        title: title,
        matrix: true
      });
    }
    const attributes = Helpers.filter(this.data.data.attributes, ([key, value]) => value.value > 0);
    const attribute = 'willpower';

    let dialogData = {
      attribute: attribute,
      attributes: attributes
    };
    let spec = false;
    let cancel = true;
    renderTemplate('systems/shadowrun5e/templates/rolls/matrix-roll.html', dialogData).then(dlg => {
      new Dialog({
        title: `${title} Test`,
        content: dlg,
        buttons: {
          roll: {
            label: 'Normal',
            callback: () => cancel = false
          },
          spec: {
            label: 'Spec',
            callback: () => { spec = true; cancel = false; }
          }
        },
        close: (html) => {
          if (cancel) return;
          const newAtt = html.find('[name=attribute]').val();
          let att = "";
          if (newAtt) {
            att = this.data.data.attributes[newAtt];
            title += ` + ${game.i18n.localize(CONFIG.SR5.attributes[newAtt])}`;
          }
          let count = matrix_att.value + (att.value || 0) + (spec ? 2 : 0);
          return DiceSR.d6({
            event: options.event,
            actor: this,
            count: count,
            title: title,
            matrix: true
          });

        }
      }).render(true);
    });
  }

  promptRoll(options) {
    return DiceSR.d6({
      event: options.event,
      actor: this,
      dialogOptions: {
        prompt: true
      }
    });
  }

  rollAttributesTest(rollId, options) {
    const title = game.i18n.localize(CONFIG.SR5.attributeRolls[rollId]);
    const roll = this.data.data.rolls[rollId];
    return DiceSR.d6({
      event: options.event,
      actor: this,
      count: roll,
      title: `${title} Test`
    });
  }

  rollSkill(skill, options) {
    let att = this.data.data.attributes[skill.attribute];
    let title = skill.label;

    if (options.attribute) att = this.data.data.attributes[options.attribute];
    let spec = false;
    let limit = this.data.data.limits[att.limit];

    if (Helpers.hasModifiers(options.event)) {
      return DiceSR.d6({
        event: options.event,
        actor: this,
        count: skill.value + att.value + (options.event[SR5.kbmod.SPEC] ? 2 : 0),
        limit: limit ? limit.value : undefined,
        title: `${title} Test`,
        matrix: Helpers.isMatrix(att)
      });
    }
    let dialogData = {
      attribute: skill.attribute,
      attributes: Helpers.filter(this.data.data.attributes, ([key, value]) => value.value > 0),
      limit: att.limit,
      limits: this.data.data.limits
    };
    let cancel = true;
    renderTemplate('systems/shadowrun5e/templates/rolls/skill-roll.html', dialogData).then(dlg => {
      new Dialog({
        title: `${title} Test`,
        content: dlg,
        buttons: {
          roll: {
            label: 'Normal',
            callback: () => cancel = false
          },
          spec: {
            label: 'Spec',
            callback: () => { spec = true; cancel = false; }
          }
        },
        close: (html) => {
          if (cancel) return;
          const newAtt = html.find('[name="attribute"]').val();
          const newLimit = html.find('[name="attribute.limit"]').val();
          att = this.data.data.attributes[newAtt];
          title += ` + ${game.i18n.localize(CONFIG.SR5.attributes[newAtt])}`;
          limit = this.data.data.limits[newLimit];
          let count = (skill.value > 0 ? skill.value : -1) + att.value + (spec ? 2 : 0);
          return DiceSR.d6({
            event: options.event,
            actor: this,
            count: count,
            limit: limit ? limit.value : undefined,
            title: `${title} Test`,
            matrix: Helpers.isMatrix(att)
          });

        }
      }).render(true);
    });
  }

  rollKnowledgeSkill(catId, skillId, options) {
    const category = this.data.data.skills.knowledge[catId];
    const skill = duplicate(category.value[skillId]);
    skill.attribute = category.attribute;
    skill.label = skill.name;
    this.rollSkill(skill, options);
  }

  rollLanguageSkill(skillId, options) {
    const skill = duplicate(this.data.data.skills.language.value[skillId]);
    skill.attribute = 'intuition';
    skill.label = skill.name;
    this.rollSkill(skill, options);
  }

  rollActiveSkill(skillId, options) {
    const skill = this.data.data.skills.active[skillId];
    skill.label = game.i18n.localize(CONFIG.SR5.activeSkills[skillId]);
    this.rollSkill(skill, options);
  }

  rollAttribute(attId, options) {
    let title = game.i18n.localize(CONFIG.SR5.attributes[attId]);
    const att = this.data.data.attributes[attId];
    const atts = this.data.data.attributes;
    let dialogData = {
      attrribute: att,
      attributes: atts
    };
    let defaulting = false;
    let cancel = true;
    renderTemplate('systems/shadowrun5e/templates/rolls/single-attribute.html', dialogData).then(dlg => {
      new Dialog({
        title: `${title} Attribute Test`,
        content: dlg,
        buttons: {
          roll: {
            label: 'Continue',
            callback: () => cancel = false
          }
        },
        default: 'roll',
        close: html => {
          if (cancel) return;
          let count = att.value;
          let limit = undefined;

          const att2Id = html.find('[name=attribute2]').val();
          let att2 = null;
          if (att2Id !== 'none') {
            att2 = atts[att2Id];
            const att2IdLabel = game.i18n.localize(CONFIG.SR5.attributes[att2Id]);
            count += att2.value;
            title += ` + ${att2IdLabel}`
          }
          return DiceSR.d6({
            event: options.event,
            title: `${title} Test`,
            actor: this,
            count: count,
            limit: limit,
            matrix: Helpers.isMatrix([att, att2])
          });
        }
      }).render(true);
    });
  }

  static async pushTheLimit(roll) {
    let title = roll.find('.flavor-text').text();
    let msg = game.messages.get(roll.data().messageId)

    if (msg && msg.data && msg.data.speaker && msg.data.speaker.actor) {

      let actor = game.actors.get(msg.data.speaker.actor);

      return DiceSR.d6({
        event: {shiftKey: true, altKey: true},
        title: `${title} - Push the Limit`,
        actor: actor,
        count: 0,
        wounds: false,
      });
    }
  };

  static async secondChance(roll) {
    let formula = roll.find('.dice-formula').text();
    let hits = parseInt(roll.find('.dice-total').text());
    let title = roll.find('.flavor-text').text();
    let re = /(\d+)d6/;
    let matches = formula.match(re);
    if (matches[1]) {

      let match = matches[1];
      let pool = parseInt(match.replace('d6',''));
      if (pool != NaN && hits != NaN) {

        let msg = game.messages.get(roll.data().messageId)
        if (msg && msg.data && msg.data.speaker && msg.data.speaker.actor) {
          let actor = game.actors.get(msg.data.speaker.actor);
          let count = pool - hits;

          return DiceSR.d6({
            event: {shiftKey: true},
            title: `${title} - Second Chance`,
            count: count,
            wounds: false,
            actor: actor,
            after: (r) => {
              actor.update({"data.attributes.edge.value": actor.data.data.attributes.edge.value - 1});
            }
          });
        }
      }
    }
  };
}
