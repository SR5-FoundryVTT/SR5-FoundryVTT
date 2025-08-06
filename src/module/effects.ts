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
    const effect = item.dataset.itemId ? owner.effects.get(item.dataset.itemId)! : null;

    // The HTML dataset must be defined
    switch (icon.dataset.action) {
        case "create": {
            const effect = [{
                name: game.i18n.localize("SR5.ActiveEffect.New"),
                origin: owner.uuid
            }];

            if (owner instanceof Item && owner._isNestedItem) {
                effect[0]._id = foundry.utils.randomID();
                const sr5Effect = new SR5ActiveEffect(effect[0], { parent: owner });
                return owner.createNestedActiveEffect(sr5Effect);
            }

            return owner.createEmbeddedDocuments('ActiveEffect', effect);
        }
        case "edit":
            return effect?.sheet.render(true);

        case "delete": {
            const userConsented = await Helpers.confirmDeletion();
            if (!userConsented) return;

            return effect?.delete();
        }
        case "toggle":
            return effect?.toggleDisabled();
        case "open-origin":
            return effect?.renderSourceSheet();
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
    // Foundry doesn't support direct update on nested item effects.
    // Instead of implementing a custom solution, we just show an error message.
    // In the future NestedItems should be replaced by a linked items approach.
    if (effectUuidIsNestedItem(uuid)) return ui.notifications.error("Effects on nested items can't be managed. Move the item to the sidebar to manage.");
    const effect = await fromUuid(uuid) as SR5ActiveEffect;
    if (!effect) return;

    switch (icon.dataset.action) {
        case "edit":
            return effect.sheet.render(true);
        case "toggle":
            return effect.toggleDisabled();
        case "open-origin":
            return effect.parent?.sheet?.render(true);
    }
}

/**
 * Determine if a uuid points to a effect within a nested item.
 * 
 * These can't be managed with Foundry v11.
 * @param uuid 
 * @returns true, when the uuid points to a nested item effect.
 */
export function effectUuidIsNestedItem(uuid: string) {
    return (uuid.match(/Item./g) || []).length >= 2;
}

/**
 * Sort effects by their name.
 * @param effects The effects to be sorted by name
 * @returns Instance of the given effects, not a copy.
 */
export function prepareSortedEffects(effects: SR5ActiveEffect[], byKey: string = "name") {
    return effects.sort((a, b) => a[byKey].localeCompare(b[byKey]));
}

/**
 * Collect all enabled Active Effects which are present on any owned or nested Item.
 * 
 * TODO: Move into data preparation phase, similar to how actor.effects works.
 * @param document The document to collect item effects from.
 * @param options See allApplicableItemEffects documentation
 * @returns A data object containing all enabled effects with their name as key and sorted alphabetically.
 */
export function prepareSortedItemEffects(document: SR5Actor|SR5Item, options: ApplicableItemEffectOptions = {}): Shadowrun.AllEnabledEffectsSheetData {
    const enabledEffects: Shadowrun.AllEnabledEffectsSheetData = [];

    for (const effect of allApplicableItemsEffects(document, options)) {
        enabledEffects.push(effect);
    }

    return prepareSortedEffects(enabledEffects, 'sheetName');
}

interface ApplicableItemEffectOptions {
    applyTo?: string[]
    nestedItems?: boolean
}

interface ApplicableDocumentEffectOptions {
    applyTo?: string[]
}

/**
 * Collect all local effects from a given document.
 * 
 * To collect effects of embedded items, use allApplicableItemEffects.
 * 
 * @param document Either an actor or item document.
 * @param options.applyTo A iterable of apply-to target values
 */
export function *allApplicableDocumentEffects(document: SR5Actor|SR5Item, options: ApplicableDocumentEffectOptions = {}) {
    const applyTo = options.applyTo ?? [];

    for (const effect of document.effects) {
        if (applyTo.length > 0 && !applyTo.includes(effect.system.applyTo)) continue;
        yield effect;
    }
}

/**
 * Collect all effects from a documents items and nested items.
 * 
 * @param document Either a actor or item document.
 * @param options.applyTo A iterable of apply-to target values
 * @param options.nestedItems Whether to include nested items
 * @returns An iterator effect
 */
export function *allApplicableItemsEffects(document: SR5Actor|SR5Item, options: ApplicableItemEffectOptions = {}) {
    const applyTo = options.applyTo ?? [];
    const nestedItems = options.nestedItems ?? true;

    for (const item of document.items) {
        for (const effect of item.effects) {
            if (applyTo.length > 0 && !applyTo.includes(effect.system.applyTo)) continue ;
            yield effect;
        }

        if (!nestedItems) continue;
        if (document instanceof SR5Item) continue;

        for (const nestedItem of item.items) {
            for (const effect of nestedItem.effects) {
                if (applyTo.length > 0 && !applyTo.includes(effect.system.applyTo)) continue;
                yield effect;
            }
        }
    }
}
