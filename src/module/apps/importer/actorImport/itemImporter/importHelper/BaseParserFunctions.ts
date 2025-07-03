import { DataDefaults } from "../../../../../data/DataDefaults";
import { SR5 } from "../../../../../config";
import { SR5Item } from "src/module/item/SR5Item";

export function getValues(val: string) {
    const regex = /(-?[0-9]+)(?:([0-9]+))*/g;
    const l = val.match(regex);
    return l || ['0'];
};

export function getArray<T>(value: T | T[] | undefined | null): T[] {
    if (value)
        return Array.isArray(value) ? value : [value];
    return [];
}

/**
 *  Creates the description data from the chummer entry
 *  @param chummerEntry The chummer entry (the item)
 */
export function parseDescription(chummerEntry: {
    source?: string|null, page?: string|null, description?: string|null, notes?: string|null
}) {
    const parsedDescription = DataDefaults.createData('description');

    if (chummerEntry.source && chummerEntry.page) {
        parsedDescription.source = `${chummerEntry.source} ${chummerEntry.page}`
    }

    if (chummerEntry.description) {
        parsedDescription.value = chummerEntry.description;
    }

    if (chummerEntry.notes) {
        parsedDescription.value = chummerEntry.notes;
    }

    return parsedDescription
}

/**
 *  Creates the technology data from the chummer entry
 *  @param chummerEntry The chummer entry (the item)
 */
export function parseTechnology(chummerEntry:{
    rating?: string|null|undefined, avail?: string|null|undefined, qty?: string|null|undefined,
    cost?: string|null|undefined, equipped?: "True"|"False"|null|undefined,
    conditionmonitor?: string|null|undefined, conceal?: string|null|undefined
}) {
    const parsedTechnology = DataDefaults.createData('technology');

    if (chummerEntry.rating) {
        parsedTechnology.rating = Number(chummerEntry.rating) || 0;
    }

    if (chummerEntry.avail) {
        parsedTechnology.availability = chummerEntry.avail;
    }

    if (chummerEntry.qty) {
        parsedTechnology.quantity = Number(chummerEntry.qty) || 0;
    }

    if (chummerEntry.cost) {
        parsedTechnology.cost = Number(chummerEntry.cost.replace(/[^\d.-]/g, "")) || 0;
    }

    if (chummerEntry.equipped === 'True') {
        parsedTechnology.equipped = true;
    }

    if (chummerEntry.conditionmonitor) {
        parsedTechnology.condition_monitor.max = Number(chummerEntry.conditionmonitor) || 0;
    }

    if (chummerEntry.conceal) {
        parsedTechnology.conceal.base = Number(chummerEntry.conceal) || 0;
    }

    return parsedTechnology
}

export function setSubType(parsedItem: ReturnType<SR5Item['system']['toObject']>, parserType: string, subType: string)  {
    if (Object.keys(SR5.itemSubTypeIconOverrides[parserType]).includes(subType)) {
        parsedItem.importFlags.subType = formatAsSlug(subType);
    }
}

export function createItemData<T extends Item.ConfiguredSubTypes>(
    name: string,
    type: T,
    system: T extends any ? ReturnType<Extract<Item.SystemOfType<T>, { toObject: (...args: any[]) => any }>['toObject']> : never
) {
    return {
        name,
        _id: '',
        img: null as string | null,
        folder: '',
        flags: {},
        type,
        system
    };
}

// formatAsSlug and genImportFlags copied from original implementation in bulk importer DataImporter.ts
/**
* Reformat the name or subtype name so it matches the categories in config.ts
* @param name The item's name or subtype name to reformat
*/
export function formatAsSlug(name: string) {
    return name.trim().toLowerCase().replace((/'|,|\[|\]|\(|\)|:/g), '').split((/-|\s|\//g)).join('-');
}

 /**
 * Generate default import flags
 * @param name The item's English name, formatted as a slug using formatAsSlug
 * @param type The item's type
 */
export function genImportFlags(name: string, type: string) {
    const flags = {
        name, // original english name
        type,
        subType: '',
        isFreshImport: true,
        isImported: true
    }
    return flags;
}
