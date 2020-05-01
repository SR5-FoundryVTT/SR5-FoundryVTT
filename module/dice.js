import { Helpers } from './helpers.js';
import { SR5 } from './config.js';

export class DiceSR {
  static d6({event, count, mod, actor, limit, limitMod, title="Roll", prefix, suffix, after, extended, matrix, dialogOptions, wounds=true}) {
    const roll = async (count, limit, explode) => {
      let formula = `${count}d6`;
      if (explode) {
        formula += 'x6';
      }
      if (limit) {
        formula += `kh${limit}`;
      }

      formula += 'cs>=5'
      if (suffix) formula += suffix;
      if (prefix) formula = prefix + formula;

      let roll = new Roll(formula);
      let rollMode = game.settings.get("core", "rollMode");

      /*
      roll.roll();

      const hits = roll.total;
      const fails = roll.dice[0].rolls.reduce((fails, r) => (r.roll === 1) ? fails + 1 : fails, 0);

      const template = 'systems/shadowrun5e/templates/rolls/roll-card.html';
      const templateData = {
        actor: actor,
        hits: roll.total,
        fails: fails,
        roll: roll,
        count: count,
        limit: limit,
        edge: edge
      };
      const html = await renderTemplate(template, templateData);
      const chatData = {
        user: game.user._id,
        speaker: ChatMessage.getSpeaker({actor: actor}),
        type: CONST.CHAT_MESSAGE_TYPES.ROLL,
        content: html
      };
      */

      // ChatMessage.create(chatData, {displaySheet: false});

      roll.toMessage({
        speaker: ChatMessage.getSpeaker({actor: actor}),
        flavor: title,
        rollMode: rollMode
      });

      return roll;
    };
    if (!mod) mod = 0;

    if (actor && !(title.includes('Soak') || title.includes('Drain') || title.includes('Fade'))) {
      if (wounds) wounds = actor.data.data.wounds.value;
      if (matrix) {
        const m = actor.data.data.matrix;
        if (m.hot_sim) mod += 2;
        if (m.running_silent) mod -= 2;
      }
      if (actor.data.data.modifiers.global) {
        mod += actor.data.data.modifiers.global;
      }
    }

    let total = parseInt(count) || 0;

    if (!game.settings.get("shadowrun5e", "applyLimits")) {
      limit = undefined;
    }

    if ((event && Helpers.hasModifiers(event))) {
      if (wounds) total -= wounds;
      if (mod) total += mod;
      let edge = event[SR5.kbmod.EDGE];
      if (edge && actor) {
        total += actor.data.data.attributes.edge.max;
        actor.update({"data.attributes.edge.value": actor.data.data.attributes.edge.value - 1});
      }
      let r = roll(total, edge ? undefined : limit, edge);
      if (after) after(r);
      return;
    }

    let dialogData = {
      options: dialogOptions,
      extended: extended,
      dice_pool: total,
      mod: mod || "",
      limit: limit,
      limitMod: limitMod || "",
      wounds: wounds
    };
    let template = 'systems/shadowrun5e/templates/rolls/roll-dialog.html';
    let edge = false;
    let cancel = true;
    return new Promise(resolve => {
      renderTemplate(template, dialogData).then(dlg => {
        new Dialog({
          title: title,
          content: dlg,
          buttons: {
            roll: {
              label: 'Roll',
              icon: '<i class="fas fa-dice-six"></i>',
              callback: () => cancel = false
            },
            edge: {
              label: 'Push the Limit',
              icon: '<i class="fas fa-bomb"></i>',
              callback: () => { edge = true; cancel = false; }
            }
          },
          default: 'roll',
          close: html => {
            if (cancel) return;
            total = parseInt(html.find('[name="dice_pool"]').val());
            limit = parseInt(html.find('[name="limit"]').val());
            mod = parseInt(eval(html.find('[name="mod"]').val()));
            limitMod = parseInt(html.find('[name="limit_mod"]').val());
            wounds = parseInt(html.find('[name=wounds]').val());
            extended = html.find('[name=extended]').val();
            dialogOptions = {
              ...dialogOptions,
              environmental: parseInt(html.find('[name="options.environmental"]').val())
            };

            if (mod) total += mod;
            if (limitMod) limit += limitMod;
            if (wounds) total -= wounds;
            if (dialogOptions.environmental) total -= dialogOptions.environmental;
            if (dialogOptions.matrix) total -= dialogOptions.matrix;
            if (edge && actor) {
              total += actor.data.data.attributes.edge.max;
              actor.update({"data.attributes.edge.value": actor.data.data.attributes.edge.value - 1});
            }
            let r = roll(total, edge ? undefined : limit, edge);
            r.then(async r => {
              if (after) await after(r);
              if (extended) {
                count -= 1;
                // add a bit of a delay to roll again
                // helps with any updates that happened inside after and to not spam the user
                setTimeout(() => DiceSR.d6({event, count, mod, actor, limit, limitMod, title, prefix, suffix, extended, dialogOptions, wounds, after}), 400);
              }
            });
          }
        }).render(true);
      });
    });
  }
}
