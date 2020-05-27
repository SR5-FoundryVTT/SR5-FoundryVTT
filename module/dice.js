import { SR5 } from './config.js';

export class DiceSR {
  static async basicRoll({count, limit, explode, prefix, suffix, title, actor}) {
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
    roll.toMessage({
      speaker: ChatMessage.getSpeaker({actor: actor}),
      flavor: title,
      rollMode: rollMode
    });

    return roll;
  };

  static rollTest({event, actor, mods = {}, specialization, limit, matrix, extended, prefix, suffix, dialogOptions, base = 0, title = "Roll", wounds = true }) {
    // if we aren't for soaking some damage
    if (actor && !(title.includes('Soak') || title.includes('Drain') || title.includes('Fade'))) {
      if (wounds) wounds = actor.data.data.wounds.value;
      if (matrix) {
        const m = actor.data.data.matrix;
        if (m.hot_sim) mods['SR5.HotSim'] = 2;
        if (m.running_silent) mods['SR5.RunningSilent'] = -2;
      }
      if (actor.data.data.modifiers.global) {
        mods['SR5.Global'] = actor.data.data.modifiers.global;
      }
    }
    if (specialization) {
      mods[specialization] = 2
    }

    if (!game.settings.get("shadowrun5e", "applyLimits")) {
      limit = undefined;
    }

    if (wounds) mods['SR5.Wounds'] = -wounds;

    let dice_pool = base;

    const edgeAttMax = actor ? actor.data.data.attributes.edge.max : 0;

    if (event && event[SR5.kbmod.EDGE]) {
      mods['SR5.Edge'] = +edgeAttMax;
      actor?.update({"data.attributes.edge.value": actor.data.data.attributes.edge.value - 1});
    }

    // add mods to dice pool
    dice_pool += Object.values(mods).reduce((acc, curr) => acc += curr, 0);

    if (event && event[SR5.kbmod.STANDARD]) {
      const edge = mods['SR5.Edge'] || undefined;
      return this.basicRoll({count: dice_pool, explode: edge, limit: edge ? undefined : limit, prefix, suffix, title, actor});
    }

    let dialogData = {
      options: dialogOptions,
      extended: extended,
      dice_pool: dice_pool,
      base: base,
      mods: mods,
      limit: limit,
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
              label: `Push the Limit (+${edgeAttMax})`,
              icon: '<i class="fas fa-bomb"></i>',
              callback: () => { edge = true; cancel = false; }
            }
          },
          default: 'roll',

          close: html => {
            if (cancel) return;
            let limitVal = parseInt(html.find('[name="limit"]').val())
            wounds = parseInt(html.find('[name=wounds]').val());
            extended = html.find('[name=extended]').val();
            dialogOptions = {
              ...dialogOptions,
              environmental: parseInt(html.find('[name="options.environmental"]').val())
            };

            let total = base;
            const modTotal = Object.values(mods).reduce((acc, curr) => acc += curr, 0);
            if (modTotal) total += modTotal;
            if (wounds) total -= wounds;
            if (dialogOptions.environmental) total -= dialogOptions.environmental;
            if (edge && actor) {
              total += actor.data.data.attributes.edge.max;
              actor.update({"data.attributes.edge.value": actor.data.data.attributes.edge.value - 1});
            }
            const r = this.basicRoll({count: total, explode: edge, limit: edge ? undefined : limitVal, prefix, suffix, title, actor});
            if (extended) {
              const currentExtended = mods['SR5.Extended'] || 0;
              mods['SR5.Extended'] = currentExtended - 1;
              // add a bit of a delay to roll again
              setTimeout(() => DiceSR.rollTest({event, base, mods, actor, limit, title, prefix, suffix, extended, dialogOptions, wounds}), 400);
            }
            resolve(r);
          }
        }).render(true);
      });
    });
  }
}
