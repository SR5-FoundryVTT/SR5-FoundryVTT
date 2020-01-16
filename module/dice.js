import { Helpers } from './helpers.js';
import { SR5 } from './config.js';

/**
 * @param {Event} event         The triggering event which initiated the roll
 * @param {Number} count        The number of d6's to roll
 * @param {Actor} actor         The actor making the d6 roll
 * @param {Number} limit        The limit for the roll -- leave undefined for no limit
 *
 */

export class DiceSR {
  static d6({event, count, mod, actor, limit, limitMod, title="Roll", prefix, suffix, after, extended, matrix, dialogOptions, wounds=true}) {
    const roll = (count, limit, explode) => {
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

      roll.toMessage({
        flavor: title
      });

      return roll;
    };
    if (!mod) mod = 0;

    if (actor) {
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

    if (event && Helpers.hasModifiers(event)) {
      total -= wounds;
      total += mods;
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
              label: 'Edge',
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
            resolve(r);
            if (after) after(r);
            if (extended) {
              count -= 1;
              DiceSR.d6({event, count, mod, actor, limit, limitMod, title, prefix, suffix, after, extended, dialogOptions, wounds, after});
            }
          }
        }).render(true);
      });
    });
  }
}
