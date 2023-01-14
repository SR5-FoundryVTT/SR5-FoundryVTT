/**
 * Utils used in DocumentSheet classes
 */

import Tagify from '@yaireo/tagify';
import { SR5 } from '../config';

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