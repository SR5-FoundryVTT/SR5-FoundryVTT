import { DataDefaults } from "../../data/DataDefaults";
import { iconAssign } from '../iconAssigner/iconAssign';

export const getValues = (val) => {
    const regex = /(-?[0-9]+)(?:([0-9]+))*/g;
    const l = val.match(regex);
    return l || ['0'];
};

export const getArray = (value) => {
    return Array.isArray(value) ? value : [value];
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
        parsedDescription.value = TextEditor.enrichHTML(chummerEntry.description);
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

    if (chummerEntry.equipped && chummerEntry.equipped.toLowerCase() === 'true') {
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

export const createItemData = (name, type, system) => {
    return {
        name: name,
        _id: '',
        folder: '',
        flags: {},
        img: iconAssign(type, name, system),
        type: type,
        system,
        permission: {
            default: 2,
        },
    };
}


