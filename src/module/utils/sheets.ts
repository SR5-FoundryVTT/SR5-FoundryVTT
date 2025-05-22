/**
 * Utils used in DocumentSheet classes
 */

import Tagify from '@yaireo/tagify';
import { SR5ActiveEffect } from '../effect/SR5ActiveEffect';
import { SYSTEM_NAME } from '../constants';
import { Translation } from './strings';

// A single whitelist / dropdown / tag element
interface TagData {
    // Identification value
    id: string
    // Display information for id
    value: string
}

interface TagifyOptions {
    // Allowed tag inputs / dropdown content for selection
    whitelist?: TagData[]
    // tagify.dropdown.maxItems => max items shown on dropdown
    maxItems?: number
    // Tags to be pre-applied
    tags?: TagData[]
    // Should only tags in whitelist be allowed?
    enforceWhitelist?: boolean
}

/**
 * Create a tagify instance for a given DOM element.
 * 
 * For tagify information, check this: https://github.com/yairEO/tagify
 * 
 * @param input The dom input element for a tagify element to be created onto.
 */
export function createTagify(input: HTMLInputElement|HTMLTextAreaElement|null, options: TagifyOptions = {}) {
    const tagify = new Tagify(input, {
        enforceWhitelist: options.enforceWhitelist ?? true,
        editTags: false,
        skipInvalid: true,
        dropdown: {
            maxItems: options.maxItems,
            fuzzySearch: true,
            enabled: 0,
            searchKeys: ["id", "value"]
        }
    });


    tagify.whitelist = options.whitelist ?? [];
    tagify.addTags(options.tags ?? []);

    return tagify;
}

interface TagifyValue {
    label: Translation
    id: string
}
interface TagifyTag {
    value: string
    id: string
}

export type TagifyValues = TagifyValue[]
export type TagifyTags = TagifyTag[]
export type OnEventCallback = (event: Event) => void

/**
 * Create a tagify from a given input element.
 * 
 * TODO: This function is horrific and in need of a refactor for clarity.
 * 
 * @param element 
 * @param values 
 * @param maxItems 
 * @param tags 
 * @param onChangeCallback
 * @param options
 */
export function createTagifyOnInput(element: HTMLInputElement, values: TagifyValues, maxItems: number, tags: TagifyTags, onChangeCallback?: OnEventCallback, options?: TagifyOptions): Tagify {
    options = options ?? {};

    const whitelist = values.map(value => ({value: game.i18n.localize(value.label), id: value.id}));
    // const tags = selected.map(value => ({value: game.i18n.localize(value), id: value}));
    const tagify = createTagify(element, {whitelist, maxItems, tags, ...options});

    if (onChangeCallback) $(element).on('change', onChangeCallback);

    return tagify;
}

type FlagType = "applyTo" | "appliedByTest" | "onlyForEquipped" | "onlyForWireless" | "onlyForItemTest";
const tagsToIds = (tags: TagifyTags) => tags.map(tag => tag.id);
export const tagifyFlagsToIds = (effect: SR5ActiveEffect, flag: FlagType): string[] => {
    const value = effect.getFlag(SYSTEM_NAME, flag);
    if (!value) return [];
    const tags = JSON.parse(value as string);
    return tagsToIds(tags);
}

/**
 * Helper to parse FoundryVTT DropData directly from it's source event
 *
 * This is a legacy handler for earlier FoundryVTT versions, however it's good
 * practice to not trust faulty input and inform about.
 *
 * @param event
 * @returns undefined when an DropData couldn't be parsed from it's JSON.
 */
export function parseDropData(event): any | undefined {
    try {
        return JSON.parse(event.dataTransfer.getData('text/plain'));
    } catch (error) {
        return console.log('Shadowrun 5e | Dropping a document onto an item sheet caused this error', error);
    }
}