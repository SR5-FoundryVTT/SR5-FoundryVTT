import { SR5Actor } from './actor/SR5Actor';

export const highlightSuccessFailure = (message, html) => {
    if (!message) return;
    if (!message.isContentVisible || !message.roll.parts.length) return;
    const { roll } = message;
    if (!roll.parts.length) return;
    if (!roll.parts[0].rolls) return;

    const khreg = /kh\d+/;
    const match = roll.formula.match(khreg);

    const limit = match ? +match[0].replace('kh', '') : 0;

    const hits = roll.total;
    const fails = roll.parts[0].rolls.reduce((fails, r) => (r.roll === 1 ? fails + 1 : fails), 0);
    const count = roll.parts[0].rolls.length;
    const glitch = fails > count / 2.0;

    if (limit && hits >= limit) {
        html.find('.dice-total').addClass('limit-hit');
    } else if (glitch) {
        html.find('.dice-total').addClass('glitch');
    }
};

export const addChatMessageContextOptions = function (html, options) {
    const canRoll = (li) => {
        const msg = game.messages.get(li.data().messageId);

        return !!(
            li.find('.dice-roll').length &&
            msg &&
            (msg.user.id === game.user.id || game.user.isGM)
        );
    };

    options.push(
        {
            name: 'Push the Limit',
            callback: (li) => SR5Actor.pushTheLimit(li),
            condition: canRoll,
            icon: '<i class="fas fa-meteor"></i>',
        },
        {
            name: 'Second Chance',
            callback: (li) => SR5Actor.secondChance(li),
            condition: canRoll,
            icon: '<i class="fas fa-dice-d6"></i>',
        }
    );
    return options;
};

export const addRollListeners = (app, html) => {
    console.log(app);
    if (!app.getFlag('shadowrun5e', 'customRoll')) return;
    html.on('click', '.card-title', (ev) => {
        ev.preventDefault();
        $(ev.currentTarget).siblings('.card-description').toggle();
    });
    $(html).find('.card-description').hide();
}
