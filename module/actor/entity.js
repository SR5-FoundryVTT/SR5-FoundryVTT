import { DiceSR } from '../dice.js';
import { Helpers } from '../helpers.js';
import { SR5 } from '../config.js';

export class SR5Actor extends Actor {

  prepareData(actorData) {
    actorData = super.prepareData(actorData);

    const items = actorData.items;
    const data = actorData.data;
    const attrs = data.attributes;
    const armor = data.armor;

    console.log(data);

    Helpers.addLabels(data.skills);
    Helpers.addLabels(data.attributes);

    const limits = data.limits;
    limits.physical.value = Math.ceil(((2 * attrs.strength.value)
        + attrs.body.value
        + attrs.reaction.value) / 3)
        + (limits.physical.mod || 0);
    limits.mental.value = Math.ceil(((2 * attrs.logic.value)
      + attrs.intuition.value
      + attrs.willpower.value) / 3)
      + (limits.mental.mod || 0);
    limits.social.value = Math.ceil(((2 * attrs.charisma.value)
      + attrs.willpower.value
      + attrs.essence.value) / 3)
      + (limits.social.mod || 0);

    const movement = data.movement;
    movement.walk.value = attrs.agility.value
      * (movement.walk.mult ? movement.walk.mult : 1);
    movement.run.value = attrs.agility.value
      * (movement.run.mult ? movement.run.mult : 2);

    const track = data.track;
    track.physical.max = 8 + Math.ceil(attrs.body.value / 2)
      + (track.physical.mod ? track.physical.mod : 0);
    track.physical.overflow = attrs.body;
    track.stun.max = 8 + Math.ceil(attrs.willpower.value / 2)
      + (track.stun.mod ? track.stun.mod : 0);

    const init = data.initiative;

    init.meatspace.base.base = attrs.intuition.value + attrs.reaction.value;
    init.meatspace.dice.base = 1;

    init.astral.base.base = attrs.intuition.value * 2;
    init.astral.dice.base = 2;

    init.matrix.base.base = attrs.intuition.value + data.matrix.data_processing.value;
    init.matrix.dice.base = data.matrix.hot_sim ? 4 : 3;

    if (data.initiative.perception === 'matrix') init.current = init.matrix;
    else if (data.initiative.perception === 'astral') init.current = init.astral;
    else {
      init.current = init.meatspace;
      data.initiative.perception = 'meatspace';
    }

    init.current.dice.value = init.current.dice.base + init.current.dice.mod;
    init.current.dice.text = `${init.current.dice.value}d6`;
    init.current.base.value = init.current.base.base + init.current.base.mod;

    armor.value = 0;
    armor.mod = 0;
    const matrix = data.matrix;
    matrix.firewall.value = matrix.firewall.mod;
    matrix.data_processing.value = matrix.data_processing.mod;
    matrix.attack.value = matrix.attack.mod;
    matrix.sleaze.value = matrix.sleaze.mod;
    for (let item of Object.values(items)) {
      if (item.type === 'armor' && item.data.technology.equipped) {
        if (item.data.armor.mod) armor.mod += item.data.armor.value; // if it's a mod, add to the mod field
        else armor.value = item.data.armor.value; // if not a mod, set armor.value to the items value
      } else if (item.type === 'device' && item.data.technology.equipped) {
        matrix.device = item;
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

    const soak = attrs.body.value + armor.value + armor.mod;
    const drainAtt = attrs[data.magic.attribute];
    data.rolls = {
      ...data.rolls,
      defense: attrs.reaction.value + attrs.intuition.value,
      drain: attrs.magic.value + (drainAtt ? drainAtt.value : 0) + (data.magic.drain ? data.magic.drain.mod : 0),
      soak: {
        default: soak,
        cold: soak + armor.cold,
        fire: soak + armor.fire,
        acid: soak + armor.acid,
        electricity: soak + armor.electricity,
        radiation: soak + armor.radiation
      },
      composure: attrs.charisma.value + attrs.willpower.value,
      judge_intentions: attrs.charisma.value + attrs.intuition.value,
      lift_carry: attrs.strength.value + attrs.body.value,
      memory: attrs.willpower.value + attrs.logic.value
    }

    return actorData;
  }

  rollDrain(options, incoming = -1) {
    const resist = this.data.data.rolls.drain;
    let title = 'Drain';
    if (incoming >= 0) title += ` (${incoming} incoming)`;
    DiceSR.d6({
      event: options.event,
      count: resist,
      actor: this.actor,
      title: title
    });
  }

  rollDefense(id, options) {
    const defense = this.data.data.rolls[id];
    return DiceSR.d6({
      event: options.event,
      actor: this.actor,
      count: defense
    });
  }

  rollSoak(id, options) {
    const soak = this.data.data.rolls.soak[id];
    const label = Helpers.label(id);
    return DiceSR.d6({
      event: options.event,
      actor: this.actor,
      count: soak,
      title: `Soak ${label}`
    });
  }

  rollSingleAttribute(attId, options) {
    const attr = this.data.data.attributes[attId];
    return DiceSR.d6({
      event: options.event,
      actor: this.actor,
      count: attr.value
    });
  }

  rollTwoAttributes([id1, id2], options) {
    const attr1 = this.data.data.attributes[id1];
    const attr2 = this.data.data.attributes[id2];
    const label1 = Helpers.label(id1);
    const label2 = Helpers.label(id2);
    return DiceSR.d6({
      event: options.event,
      actor: this.actor,
      count: attr1.value + attr2.value,
      title: `${label1} + ${label2}`
    });
  }

  rollAttributesTest(rollId, options) {
    const label = Helpers.label(rollId);
    const roll = this.data.data.rolls[rollId];
    return DiceSR.d6({
      event: options.event,
      actor: this.actor,
      count: roll,
      title: label
    });
  }

  rollSkill(skill, options) {

    let att = this.data.data.attributes[skill.attribute];
    let spec = false;
    let limit = this.data.data.limits[att.limit];

    if (Helpers.hasModifiers(options.event)) {
      return DiceSR.d6({
        event: options.event,
        actor: this.actor,
        count: skill.value + att.value + (options.event[SR5.kbmod.SPEC] ? 2 : 0),
        limit: limit ? limit.value : undefined,
        title: `${Helpers.label(skill.label)} Test`
      });
    }
    let dialogData = {
      attribute: skill.attribute,
      attributes: Helpers.filter(this.data.data.attributes, ([key, value]) => value.value > 0)
    };
    renderTemplate('systems/shadowrun5e/templates/rolls/skill-roll.html', dialogData).then(dlg => {
      new Dialog({
        title: `${Helpers.label(skill.label)} Test`,
        content: dlg,
        buttons: {
          roll: {
            label: 'Roll',
            icon: '<i class="fas fa-dice-six"></i>'
          },
          spec: {
            label: 'Spec',
            icon: '<i class="fas fa-plus"></i>',
            callback: () => spec = true
          }
        },
        close: (html) => {
          const newAtt = html.find('[name=attribute]').val();
          att = this.data.data.attributes[newAtt];
          limit = this.data.data.limits[att.limit];
          let count = (skill.value > 0 ? skill.value : -1) + att.value + (spec ? 2 : 0);
          return DiceSR.d6({
            event: options.event,
            actor: this.actor,
            count: count,
            limit: limit ? limit.value : undefined,
            title: `${skill.label} Test`
          });

        }
      }).render(true);
    });
  }

  rollActiveSkill(skillId, options) {
    const skill = this.data.data.skills.active[skillId];
    this.rollSkill(skill, options);
  }

  rollAttribute(attId, options) {
    let label = Helpers.label(attId);
    const att = this.data.data.attributes[attId];
    const atts = this.data.data.attributes;
    let dialogData = {
      attrribute: att,
      attributes: atts
    };
    let defaulting = false;
    renderTemplate('systems/shadowrun5e/templates/rolls/single-attribute.html', dialogData).then(dlg => {
      new Dialog({
        title: `${label} Attribute Test`,
        content: dlg,
        buttons: {
          roll: {
            label: 'Roll',
            icon: '<i class="fas fa-dice-six"></i>'
          },
          defaulting: {
            label: 'Default',
            callback: () => defaulting = true
          }
        },
        default: 'defaulting',
        close: html => {
          let count = att.value;
          let limit = undefined;
          let title = "";
          if (defaulting) {
            count -= 1;
            if (att.limit) {
              limit = this.data.data.limits[att.limit].value;
            }
            title = `Defaulting with ${label}`;
          } else {
            title = label;

            const att2Id = html.find('[name=attribute2]').val();
            if (att2Id !== 'none') {
              const att2 = atts[att2Id];
              const att2IdLabel = Helpers.label(att2Id);
              count += att2.value;
              title += ` + ${att2IdLabel}`
            }
          }
          return DiceSR.d6({
            event: options.event,
            actor: this.actor,
            count: count,
            limit: limit,
          });
        }
      }).render(true);
    });
  }
}
