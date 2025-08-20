import { SR5Item } from "src/module/item/SR5Item";
import { SR5 } from "../../../../../config";

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

export function setSubType(parsedItem: ReturnType<SR5Item['system']['toObject']>, parserType: string, subType: string)  {
    if (Object.keys(SR5.itemSubTypeIconOverrides[parserType]).includes(subType)) {
        parsedItem.importFlags.subType = formatAsSlug(subType);
    }
}

export function createItemData<T extends Item.ConfiguredSubType>(
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
