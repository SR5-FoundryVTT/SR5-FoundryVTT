import { DataDefaults } from "../../../../../data/DataDefaults";
import { SR5 } from "../../../../../config";

export const getValues = (val) => {
    const regex = /(-?[0-9]+)(?:([0-9]+))*/g;
    const l = val.match(regex);
    return l || ['0'];
};

export const getArray = (value) => {
    if(value) {
        return Array.isArray(value) ? value : [value];
    }
    return []
};

/**
 *  Creates the description data from the chummer entry
 *  @param chummerEntry The chummer entry (the item)
 */
export const parseDescription = (chummerEntry) => {
    const parsedDescription = DataDefaults.descriptionData();

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
export const parseTechnology = (chummerEntry) => {
    const parsedTechnology = DataDefaults.technologyData();

    if (chummerEntry.rating) {
        parsedTechnology.rating = chummerEntry.rating;
    }

    if (chummerEntry.avail) {
        parsedTechnology.availability = chummerEntry.avail;
    }

    if (chummerEntry.qty) {
        parsedTechnology.quantity = chummerEntry.qty;
    }

    if (chummerEntry.cost) {

        parsedTechnology.cost = parseFloat(chummerEntry.cost.replace(/[^\d\.\-]/g, ""));        
    }

    if (chummerEntry.equipped?.toLowerCase() === 'true') {
        parsedTechnology.equipped = true;
    }

    if (chummerEntry.conditionmonitor) {
        parsedTechnology.condition_monitor.max = Number(chummerEntry.conditionmonitor);
    }

    if (chummerEntry.conceal) {
        parsedTechnology.conceal.base = Number(chummerEntry.conceal);
    }

    return parsedTechnology
}

export const setSubType = (parsedItem, parserType, subType) => {
    if (Object.keys(SR5.itemSubTypeIconOverrides[parserType]).includes(subType)) {
        parsedItem.importFlags.subType = formatAsSlug(subType);
    }
}

export const createItemData = (name, type, system) => {
    return {
        name: name,
        _id: '',
        folder: '',
        flags: {},
        type: type,
        system,
        permission: {
            default: 2,
        },
    };
}

// formatAsSlug and genImportFlags copied from original implementation in bulk importer DataImporter.ts
/**
* Reformat the name or subtype name so it matches the categories in config.ts
* @param name The item's name or subtype name to reformat
*/
export const formatAsSlug = (name) => {
    return name.trim().toLowerCase().replace((/'|,|\[|\]|\(|\)|:/g), '').split((/-|\s|\//g)).join('-');
 }

 /**
 * Generate default import flags
 * @param name The item's English name, formatted as a slug using formatAsSlug
 * @param type The item's type
 */
 export const genImportFlags = (name, type) => {
    const flags = {
        name: name, // original english name
        type: type,
        subType: '',
        isFreshImport: true,
        isImported: true
    }
    return flags;
 }
