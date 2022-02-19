//@ts-nocheck // This is JavaScript code.
/**
 * All functions have been taken from : https://gitlab.com/foundrynet/dnd5e/-/blob/master/module/effects.js
 *
 * There have been some alterations made to fit the Shadowrun5e system.
 */

import {SR5Actor} from "./actor/SR5Actor";
import {SR5Item} from "./item/SR5Item";
import {Helpers} from "./helpers";
import EffectsSheetData = Shadowrun.EffectsSheetData;

/**
 * Manage Active Effect instances through the Actor Sheet via effect control buttons.
 * @param {MouseEvent} event      The left-click event on the effect control
 * @param {Actor|Item} owner      The owning entity which manages this effect
 */
export async function onManageActiveEffect(event, owner: SR5Actor|SR5Item) {
    // NOTE: This here is temporary until FoundryVTT has built-in support for nested item updates.
    if ( owner.isOwned )
        return ui.notifications.warn("Managing Active Effects within an Owned Item is not currently supported and will be added in a subsequent update.");

    event.preventDefault();
    // These element grabs rely heavily on HTML structure within the templates.
    const icon = event.currentTarget;
    const item = event.currentTarget.closest('.list-item');
    const effect = item.dataset.itemId ? owner.effects.get(item.dataset.itemId) : null;
    // The HTML dataset must be defined
    switch (icon.dataset.action) {
        case "create":
            return owner.createEmbeddedDocuments('ActiveEffect', [{
                label: game.i18n.localize("SR5.ActiveEffect.New"),
                // icon: "icons/svg/aura.svg",
                origin: owner.uuid,
                "duration.rounds": item.dataset.effectType === "temporary" ? 1 : undefined,
                disabled: item.dataset.effectType === "inactive"
            }]);

        case "edit":
            return effect.sheet.render(true);

        case "delete":
            const userConsented = await Helpers.confirmDeletion();
            if (!userConsented) return;

            return effect.delete();

        case "toggle":
            return effect.toggleDisabled();
        case "open-origin":
            return effect.renderSourceSheet();

        default:
            console.error(`An active effect with the id '${effect}' couldn't be managed as no action has been defined within the template.`);
            return;
    }
}

/**
 * Prepare the data structure for Active Effects which are currently applied to an Actor or Item.
 * @param {ActiveEffect[]} effects    The array of Active Effect instances to prepare sheet data for
 * @return {object}                   Data for rendering
 */
export function prepareActiveEffectCategories(effects): EffectsSheetData {

    // Define effect header categories
    const categories = {
        temporary: {
            type: "temporary",
            label: game.i18n.localize("SR5.ActiveEffect.Types.Temporary"),
            effects: []
        },
        passive: {
            type: "passive",
            label: game.i18n.localize("SR5.ActiveEffect.Types.Passive"),
            effects: []
        },
        inactive: {
            type: "inactive",
            label: game.i18n.localize("SR5.ActiveEffect.Types.Inactive"),
            effects: []
        }
    };

    // Iterate over active effects, classifying them into categories
    for (let effect of effects) {
        effect._getSourceName(); // Trigger a lookup for the source name
        if (effect.data.disabled) categories.inactive.effects.push(effect);
        else if (effect.isTemporary) categories.temporary.effects.push(effect);
        else categories.passive.effects.push(effect);
    }
    return categories;
}