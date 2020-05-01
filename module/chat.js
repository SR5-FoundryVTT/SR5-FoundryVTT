import { SR5Actor } from './actor/entity.js';

export const highlightSuccessFailure = function(message, html, data) {
    if (!message) return;
    if (!message.isRollVisible || !message.roll.parts.length ) return;
    const roll = message.roll;
    if (!roll.parts.length) return;

    const khreg = /kh\d+/;
    const match = roll.formula.match(khreg);

    const limit = match ? +(match[0].replace('kh', '')) : 0;

    console.log(roll);
    const hits = roll.total;
    const fails = roll.parts[0].rolls.reduce((fails, r) => (r.roll === 1) ? fails + 1 : fails, 0);
    const count = roll.parts[0].rolls.length;
    const glitch = fails > (count / 2.0);


    if (limit && hits >= limit) {
        console.log('LIMIT HIT');
        html.find('.dice-total').addClass('limit-hit');
    } else if (glitch) {
        console.log('GLITCH');
        html.find('.dice-total').addClass('glitch');
    }
}

export const addChatMessageContextOptions = function(html, options) {
  let canRoll = li => {
    let msg = game.messages.get(li.data().messageId);

    if (li.find(".dice-roll").length
          && msg 
          && (msg.user.id === game.user.id || game.user.isGM)) {
      return true;
    }

    return false;
  }
  options.push(
    {
      name: 'Push the Limit',
      callback: li => SR5Actor.pushTheLimit(li),
      condition: canRoll,
      icon: '<i class="fas fa-meteor"></i>'
    },
    {
      name: 'Second Chance',
      callback: li => SR5Actor.secondChance(li),
      condition: canRoll,
      icon: '<i class="fas fa-dice-d6"></i>'
    }
  );
  return options;
}
