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
  static d6({event, count, spec, mod, actor, limit, title="Roll", prefix, suffix, after, extended, dialogOptions, wounds=true}) {
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

    if (wounds && actor) {
      wounds = actor.data.data.wounds.value;
    }

    let total = parseInt(count) || 0;
    total += parseInt(mod) || 0;
    if (spec) total += 2;

    if (event && Helpers.hasModifiers(event)) {
      total -= wounds;
      if (event[SR5.kbmod.EDGE]) {
        roll(total, undefined, true);
      } else {
        roll(total, limit, false);
      }
      if (after) after();
      return;
    }

    let dialogData = {
      options: dialogOptions,
      extended: extended,
      dice_pool: total,
      mod: "",
      limit: limit,
      limit_mod: "",
      wounds: wounds
    };
    let template = 'systems/shadowrun5e/templates/rolls/roll-dialog.html';
    let edge = false;
    return new Promise(resolve => {
      renderTemplate(template, dialogData).then(dlg => {
        new Dialog({
          title: title,
          content: dlg,
          buttons: {
            roll: {
              label: 'Roll',
              icon: '<i class="fas fa-dice-six"></i>'
            },
            edge: {
              label: 'Edge',
              icon: '<i class="fas fa-bomb"></i>',
              callback: () => edge = true
            }
          },
          default: 'roll',
          close: html => {
            let dg = {
              dice_pool: parseInt(html.find('[name="dice_pool"]').val()),
              limit: parseInt(html.find('[name="limit"]').val()),
              mod: parseInt(html.find('[name="mod"]').val()),
              limitMod: parseInt(html.find('[name="limit_mod"]').val()),
              wounds: parseInt(html.find('[name=wounds]').val()),
              extended: html.find('[name=extended]').val(),
              options: {
                environmental: parseInt(html.find('[name="options.environmental"]').val()),
              }
            };

            if (dg.dice_pool) total = dg.dice_pool;
            if (dg.mod) total += dg.mod;
            if (dg.limitMod) limit += dg.limitMod;
            if (dg.wounds) total -= dg.wounds;
            if (dg.options.environmental) total -= dg.options.environmental;
            if (edge) limit = undefined;
            let r = roll(total, limit, edge);
            resolve(r);
            if (after) after();
            if (dg.extended) {
              count -= 1;
              extended = dg.extended;
              DiceSR.d6({event, count, spec, mod, actor, limit, title, prefix, suffix, after, extended, dialogOptions, wounds});
            }
          }
        }).render(true);
      });
    });
  }
}
