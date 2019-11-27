import { DiceSR } from '../dice.js';
import { Helpers } from '../helpers.js';
import { SR5 } from '../config.js';

export class SR5Actor extends Actor {

  prepareData(actorData) {
    actorData = super.prepareData(actorData);

    const data = actorData.data;
    const attrs = data.attributes;
    const armor = data.armor;

    Helpers.addLabels(data.skills);
    Helpers.addLabels(data.attributes);

    const limits = data.limits;
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

    const soak = attrs.body.value + armor.value + armor.mod;
    data.rolls = {
      ...data.rolls,
      defense: attrs.reaction.value + attrs.intuition.value,
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
          console.log(newAtt);
          att = this.data.data.attributes[newAtt];
          limit = this.data.data.limits[att.limit];
          let count = skill.value + att.value + (spec ? 2 : 0);
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
            const att2Id = html.find('[name=attribute2]').val();
            const att2 = atts[att2Id];
            const att2IdLabel = Helpers.label(att2Id);
            count += att2.value;
            title = `${label} + ${att2IdLabel}`
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
