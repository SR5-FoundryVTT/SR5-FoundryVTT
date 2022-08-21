/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} item     The item data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
import {Helpers} from "./helpers";
import SkillField = Shadowrun.SkillField;
import {SR5Actor} from "./actor/SR5Actor";

export async function createItemMacro(item, slot) {
    if (!game || !game.macros) return;

    const command = `game.shadowrun5e.rollItemMacro("${item.name}");`;
    let macro = game.macros.contents.find((m) => m.name === item.name);
    if (!macro) {
        macro = await Macro.create(
            {
                name: item.name,
                type: 'script',
                img: item.img,
                command: command,
                flags: { 'shadowrun5e.itemMacro': true },
            },
            { renderSheet: false },
        );
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
    if (!game || !game.actors) return;

    const speaker = ChatMessage.getSpeaker();
    let actor;
    if (speaker.token) actor = game.actors.tokens[speaker.token];
    if (!speaker.actor) return;
    if (!actor) actor = game.actors.get(speaker.actor);
    const item = actor ? actor.items.find((i) => i.name === itemName) : null;
    if (!item) {
        return ui.notifications?.warn(`Your controlled Actor does not have an item named ${itemName}`);
    }

    return item.castAction();
}

/**
 * Create a macro from an skill drop.
 *
 * @param data A data object for skill macros.
 * @param slot The hotbar slot to use.
 */
export async function createSkillMacro(data: {skillId: string, skill: SkillField}, slot) {
    if (!game.macros || !game.user) return;

    const {skillId, skill} = data;

    // Abort when skill macro already exists. This is done for consistency with createItemMacro behavior.
    const name = Helpers.getSkillLabelOrName(skill);
    // @ts-ignore
    const existingMacro = game.macros.contents.find(macro => macro.name === name);
    if (existingMacro) return;

    // Setup macro data.
    const command = `game.shadowrun5e.rollSkillMacro("${name}");`;
    const macro = await Macro.create({
        name,
        type: 'script',
        command,
        // TODO: Is flags needed here? See createItemMacro
    });
    if (macro) await game.user.assignHotbarMacro(macro, slot);
}

/**
 * Roll a skill test from a macro for an Actor.
 *
 * @param skillLabel Custom skill names must be supported and legacy skill names might be translated.
 */
export async function rollSkillMacro(skillLabel) {
    if (!game || !game.actors) return;
    if (!skillLabel) return;

    // Fetch the actor from the current users token or the actor collection.
    const speaker = ChatMessage.getSpeaker();
    if (!speaker) return;
    const actor =  (game.actors.tokens[speaker.token as string] || game.actors.get(speaker.actor as string)) as SR5Actor

    if (!actor) return;
    await actor.rollSkill(skillLabel, {byLabel: true});
    // TODO: Macro for skills may need their own TestCreate.fromSkillMacro... as they need getSkill('Label', {byLabel: true});
}