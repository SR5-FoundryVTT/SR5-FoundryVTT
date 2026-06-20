/**
 * Utils used in DocumentSheet classes
 */

import Tagify from '@yaireo/tagify';
import { Translation } from './strings';

/** An option before localization: stable id + i18n label key. */
export interface TagifyValue {
    id: string;
    label: Translation;
}

/** A pre-selected tag: stable id + already-localized display string. */
export interface TagifyTag {
    id: string;
    value: string;
}

export type TagifyValues = TagifyValue[];
export type TagifyTags = TagifyTag[];

function localizeWhitelist(whitelist: TagifyValues) {
    return whitelist.map(entry => ({ id: entry.id, value: game.i18n.localize(entry.label) }));
}

function tagifyDropdownThemeClass(element: HTMLElement) {
    const sheet = element.closest('.sr5v2');
    const isLight = sheet?.classList.contains('theme-light')
        || (!sheet?.classList.contains('theme-dark') && document.body.classList.contains('theme-light'));

    return isLight ? 'sr5-tagify-dropdown-light' : 'sr5-tagify-dropdown-dark';
}

/**
 * Create a multi-value Tagify instance on an input element.
 *
 * @param element   The input element to attach Tagify to.
 * @param whitelist Option sources — each entry has a stable id and an i18n label key.
 * @param selected  Tags to pre-select — each entry has a stable id and a localized value.
 */
export function createTagifyMulti(
    element: HTMLInputElement,
    whitelist: TagifyValues,
    selected: TagifyTags,
): Tagify<TagifyTag> {
    const tagifyWhitelist = localizeWhitelist(whitelist);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const tagify = new Tagify<TagifyTag>(element, {
        enforceWhitelist: true,
        editTags: false,
        skipInvalid: true,
        dropdown: {
            maxItems: tagifyWhitelist.length,
            fuzzySearch: true,
            enabled: 0,
            searchKeys: ['id', 'value'],
            classname: tagifyDropdownThemeClass(element),
        },
    });

    tagify.whitelist = tagifyWhitelist;
    tagify.addTags(selected);

    return tagify;
}

/**
 * Create a single-value Tagify select on an input element.
 *
 * Stores the stable id of the chosen option back to the original input (or raw
 * typed text for custom values not in the whitelist).
 *
 * @param element       The input element to attach Tagify to.
 * @param whitelist     Option sources — each entry has a stable id and an i18n label key.
 * @param currentValue  The currently stored value (stable key or free-form text).
 */
export function createTagifySelect(
    element: HTMLInputElement,
    whitelist: TagifyValues,
    currentValue: string,
): Tagify<TagifyTag> {
    const tagifyWhitelist = localizeWhitelist(whitelist);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const tagify = new Tagify<TagifyTag>(element, {
        mode: 'select',
        enforceWhitelist: false,
        editTags: 1,
        addTagOnBlur: true,
        skipInvalid: false,
        originalInputValueFormat: (vals) => {
            const tag = vals[0];
            if (!tag) return '';
            return tagifyWhitelist.find(w => w.value === tag.value)?.id ?? tag.value ?? '';
        },
        dropdown: {
            maxItems: tagifyWhitelist.length,
            fuzzySearch: true,
            enabled: 0,
            highlightFirst: false,
            searchKeys: ['id', 'value'],
            classname: tagifyDropdownThemeClass(element),
        },
    });

    tagify.whitelist = tagifyWhitelist;

    if (currentValue) {
        const known = tagifyWhitelist.find(w => w.id === currentValue);
        tagify.addTags([known ?? { id: currentValue, value: currentValue }]);
    }

    return tagify;
}

/**
 * Helper to parse FoundryVTT DropData directly from its source event.
 *
 * This is a legacy handler for earlier FoundryVTT versions, however it's good
 * practice to not trust faulty input and inform about.
 *
 * @returns undefined when DropData couldn't be parsed from its JSON.
 */
export function parseDropData<T = unknown>(event: DragEvent): T | undefined {
    try {
        const raw = event.dataTransfer?.getData('text/plain');
        if (!raw) return undefined;

        return JSON.parse(raw) as T;
    } catch (error) {
        console.log('Shadowrun 5e | Dropping a document onto an item sheet caused this error', error);
        return undefined;
    }
}
