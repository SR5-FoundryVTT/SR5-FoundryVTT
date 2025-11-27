/**
 * All functions have been taken from : https://gitlab.com/foundrynet/dnd5e/-/blob/master/module/effects.js
 *
 * There have been some alterations made to fit the Shadowrun5e system.
 */

import { SR5Actor } from './actor/SR5Actor';
import { SR5Item } from './item/SR5Item';
import { SR5ActiveEffect } from './effect/SR5ActiveEffect';

/**
 * Sort effects by their name.
 * @param effects The effects to be sorted by name
 * @returns Instance of the given effects, not a copy.
 */
export function prepareSortedEffects(effects: SR5ActiveEffect[], byKey = "name") {
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
