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
  static d6({event, count=0, actor, limit, title="Roll", prefix, suffix, after, prompt, range_mode}) {
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

    if (Helpers.hasModifiers(event)) {
      if (event[SR5.kbmod.EDGE]) {
        roll(count, undefined, true);
      } else {
        roll(count, limit, false);
      }
      if (after) after();
      return;
    }

    let dialogData = {
      dice_pool: count,
      mod: "",
      limit: limit,
      limit_mod: "",
      prompt: prompt,
      range_mode: range_mode
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
            let dice_pool = parseInt(html.find('[name="dice_pool"]').val());
            let limit = parseInt(html.find('[name="limit"]').val());
            let mod = parseInt(html.find('[name="mod"]').val());
            let limitMod = parseInt(html.find('[name="limit_mod"]').val());
            let range_mode = parseInt(html.find('[name="range_mode"]').val());
            if (dice_pool) count = dice_pool;
            if (mod) count += mod;
            if (range_mode) count += range_mode;
            if (limitMod) limit += limitMod;
            if (edge) limit = undefined;
            let r = roll(count, limit, edge);
            resolve(r);
            if (after) after();
          }
        }).render(true);
      });
    });
  }
}
