import { SR5Item } from './item/SR5Item';
/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} item     The item data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
import { SR5Actor } from "./actor/SR5Actor";
import { SuccessTest, SuccessTestData } from './tests/SuccessTest';
import { SkillFieldType } from './types/template/Skills';
import { SkillFieldPrep } from './actor/prep/functions/SkillFieldPrep';

/**
 * Create a macros for different item based when a item document is dropped on the macro hotbar.
 * 
 * @param dropData Foundry DropData
 * @param slot The slot to be dropped into on the Macro bar
 */
export async function createItemMacro(dropData, slot) {
    if (!game?.macros) return;

    const item = await SR5Item.fromDropData(dropData);
    if (!(item instanceof SR5Item)) return console.error(`Shadowrun 5e | Macro Drop expected an item document but got a different document type`, item);

    if (item.isType('skill')) return createSkillMacro({ skillId: item.id!, skill: SkillFieldPrep.createSkillField(item).skillField }, slot);

    const command = `game.shadowrun5e.rollItemMacro("${item.name}");`;
    let macro = game.macros.contents.find((m: Macro.Stored<"script" | "chat">) => m.name === item.name) as Macro;
    if (!macro) {
        macro = await Macro.create(
            {
                name: item.name,
                type: 'script',
                img: item.img,
                command: command,
                flags: { shadowrun5e: { itemMacro: true } },
            },
            { renderSheet: false },
        ) as Macro;
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
    if (!game?.actors) return;

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
 * Create a macro from a skill field drop.
 * 
 * NOTE: There used to be special handling for drag&drop of SkillField, this is now handled by default item drag&drop
 *       and createItemMacro.
 *
 * @param data A data object for skill macros.
 * @param slot The hotbar slot to use.
 */
export async function createSkillMacro(data: { skillId: string, skill: SkillFieldType }, slot) {
    if (!game.macros || !game.user) return;

    const { skill } = data;

    // Abort when skill macro already exists. This is done for consistency with createItemMacro behavior.
    const existingMacro = game.macros.contents.find(macro => macro.name === skill.label);
    if (existingMacro) return;

    // Setup macro data.
    const command = `game.shadowrun5e.rollSkillMacro("${skill.label}");`;
    const macro = await Macro.create({
        name: skill.label,
        img: skill.img,
        type: 'script',
        command,
    });
    if (macro) await game.user.assignHotbarMacro(macro, slot);
}

/**
 * Roll a skill test from a macro for an Actor.
 *
 * @param skillLabel Custom skill names must be supported and legacy skill names might be translated.
 */
export async function rollSkillMacro(skillLabel): Promise<SuccessTest<SuccessTestData> | void> {
    if (!game?.actors) return;
    if (!skillLabel) return;

    // Fetch the actor from the current users token or the actor collection.
    const speaker = ChatMessage.getSpeaker();
    if (!speaker) return;
    const actor = (game.actors.tokens[speaker.token as string] || game.actors.get(speaker.actor as string)) as SR5Actor

    if (!actor) return;
    return actor.rollSkill(skillLabel, { byLabel: true });
}