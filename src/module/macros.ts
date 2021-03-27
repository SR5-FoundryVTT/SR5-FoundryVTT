/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} item     The item data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
export async function createItemMacro(item, slot) {
    const command = `game.shadowrun5e.rollItemMacro("${item.name}");`;
    let macro = game.macros.entities.find((m) => m.name === item.name);
    if (!macro) {
        macro = (await Macro.create(
            {
                name: item.name,
                type: 'script',
                img: item.img,
                command: command,
                flags: { 'shadowrun5e.itemMacro': true },
            },
            { displaySheet: false },
        )) as Macro;
    }
    if (macro) game.user?.assignHotbarMacro(macro, slot);
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemName
 * @return {Promise}
 */
export function rollItemMacro(itemName) {
    const speaker = ChatMessage.getSpeaker();
    let actor;
    if (speaker.token) actor = game.actors.tokens[speaker.token];
    if (!actor) actor = game.actors.get(speaker.actor);
    const item = actor ? actor.items.find((i) => i.name === itemName) : null;
    if (!item) {
        // @ts-ignore
        return ui.notifications?.warn(`Your controlled Actor does not have an item named ${itemName}`);
    }

    return item.castAction();
}