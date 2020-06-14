import { SR5Actor } from './actor/SR5Actor';
import { SR5Item } from './item/SR5Item';
import Template from './template';

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
    if (!app.getFlag('shadowrun5e', 'customRoll')) return;
    html.on('click', '.test', async (event) => {
        event.preventDefault();
        const type = event.currentTarget.dataset.action;
        const item = SR5Item.getItemFromMessage(html);
        if (item) {
            await item.rollExtraTest(type, event);
        }
    });
    html.on('click', '.place-template', (event) => {
        event.preventDefault();
        const item = SR5Item.getItemFromMessage(html);
        if (item) {
            const template = Template.fromItem(item);
            template?.drawPreview(event);
        }
        console.log(event);
    })
    html.on('click', '.card-title', (event) => {
        event.preventDefault();
        $(event.currentTarget).siblings('.card-description').toggle();
    });
    $(html).find('.card-description').hide();
};
