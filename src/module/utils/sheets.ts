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
        enforceWhitelist: true,
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

/**
 * Create a tagify from a given input element.
 * 
 * @param element 
 * @param whitelist 
 * @param maxItems 
 * @param selected 
 */
export function createTagifyOnInput(element: HTMLInputElement, options: TagifyValues, maxItems: number, selected: TagifyTags, onChangeCallback?: Function): Tagify {
    const whitelist = options.map(value => ({value: game.i18n.localize(value.label), id: value.id}));
    // const tags = selected.map(value => ({value: game.i18n.localize(value), id: value}));
    const tagify = createTagify(element, {whitelist, maxItems, tags: selected});

    // @ts-expect-error
    if (onChangeCallback) $(element).on('change', onChangeCallback);

    return tagify;
}

const tagsToIds = (tags: TagifyTags) => tags.map(tag => tag.id);
export const tagifyFlagsToIds = (effect: SR5ActiveEffect, flag: string): string[] => {
    const value = effect.getFlag(SYSTEM_NAME, flag);
    if (!value) return [];
    const tags = JSON.parse(value as string);
    return tagsToIds(tags);
}