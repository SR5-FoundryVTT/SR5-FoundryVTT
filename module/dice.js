
/**
 * @param {Event} event         The triggering event which initiated the roll
 * @param {Number} count        The number of d6's to roll
 * @param {Actor} actor         The actor making the d6 roll
 * @param {Number} limit        The limit for the roll -- leave undefined for no limit
 * @param {Boolean} edge        If 'Push the limit' was used on the roll
 *
 */

export class DiceSR {
  static d6({event, count, actor, limit, edge=false}) {

    let roll = (count, limit, explode) => {
      let roll = new Roll(`${count}d6cs>=5`);

      roll.toMessage({

      });
    }

    return roll(count, limit);
  };
}
