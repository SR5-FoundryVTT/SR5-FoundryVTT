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
import { SR5ActiveEffect } from "./effect/SR5ActiveEffect";

/**
 * Manage Active Effect instances through the Actor Sheet via effect control buttons.
 * @param {MouseEvent} event      The left-click event on the effect control
 * @param {Actor|Item} owner      The owning entity which manages this effect
 */
export async function onManageActiveEffect(event, owner: SR5Actor|SR5Item) {
    // NOTE: This here is temporary until FoundryVTT has built-in support for nested item updates.
    // if ( owner.isOwned )
    //     return ui.notifications.warn("Managing Active Effects within an Owned Item is not currently supported and will be added in a subsequent update.");

    event.preventDefault();
    // These element grabs rely heavily on HTML structure within the templates.
    const icon = event.currentTarget;    
    const item = event.currentTarget.closest('.list-item-effect');
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
            return;
    }
}

/**
 * Manage Active Effect instances of an actors item or nested item based effects.
 * 
 * @param event The left-click event on the list-item-effect control
 */
export async function onManageItemActiveEffect(event: MouseEvent) {
    event.preventDefault();

    const icon = event.currentTarget;
    const listItem = event.currentTarget.closest('.list-item-effect');
    const uuid = listItem.dataset.itemId;
    const effect = await fromUuid(uuid) as SR5ActiveEffect;
    if (!effect) return;

    switch (icon.dataset.action) {
        case "edit":
            return effect.sheet.render(true);
        case "toggle":
            return effect.toggleDisabled();
        case "open-origin":
            return effect.parent?.sheet?.render(true);
        default:
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
            tooltip: game.i18n.localize("SR5.Tooltips.Effect.Temporary"),
            effects: []
        },
        persistent: {
            type: "persistent",
            label: game.i18n.localize("SR5.ActiveEffect.Types.Persistent"),
            tooltip: game.i18n.localize("SR5.Tooltips.Effect.Persistent"),
            effects: []
        },
        inactive: {
            type: "inactive",
            label: game.i18n.localize("SR5.ActiveEffect.Types.Inactive"),
            tooltip: game.i18n.localize("SR5.Tooltips.Effect.Inactive"),
            effects: []
        }
    };

    // Iterate over active effects, classifying them into categories
    for (const effect of effects) {
        if (effect.disabled) categories.inactive.effects.push(effect);
        else if (effect.isTemporary) categories.temporary.effects.push(effect);
        else categories.persistent.effects.push(effect);
    }

    return categories;
}

/**
 * Collect all enabled Active Effects which are present on any owned or nested Item.
 * 
 * TODO: Move into data preparation phase, similar to how actor.effects works.
 * @param actor The actor collect effects from.
 * @returns A data object containing all enabled effects with their name as key and sorted alphabetically.
 */
export function prepareEnabledEffects(actor: SR5Actor): Shadowrun.AllEnabledEffectsSheetData {
    const enabledEffects: Shadowrun.AllEnabledEffectsSheetData = [];

    for (const effect of allEnabledItemEffects(actor)) {
        enabledEffects.push(effect);
    }

    // Alphabetically sort effects by label.
    enabledEffects.sort((a, b) => a.name.localeCompare(game.i18n.localize(b.label)));

    return enabledEffects;
}

/**
 * Iterator for all enabled effects of an actors owned and nested items.
 * @param actor 
 */
function *allEnabledItemEffects(actor: SR5Actor) {
    for (const item of actor.items) {
        for (const effect of item.effects) {
            if (effect.disabled) continue;
            yield effect;
        }

        for (const nestedItem of item.items) {
            for (const effect of nestedItem.effects) {
                if (effect.disabled) continue;
                yield effect;
            }
        }
    }
}