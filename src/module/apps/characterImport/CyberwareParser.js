import { parseDescription, getArray, parseTechnology, createItemData, formatAsSlug, genImportFlags } from "./BaseParserFunctions.js"
import * as IconAssign from '../../apps/iconAssigner/iconAssign';
import { SR5 } from "../../config";
export class CyberwareParser {

    async parseCyberwares(chummerChar, assignIcons) {
        const chummerCyberwares = getArray(chummerChar.cyberwares.cyberware);
        const parsedCyberware = [];
        const iconList = await IconAssign.getIconFiles();

        await chummerCyberwares.forEach( async (chummerCyber) => {
            try {
                const itemData = this.parseCyberware(chummerCyber);

                // Assign the icon if enabled
                if (assignIcons) itemData.img = await IconAssign.iconAssign(itemData.system.importFlags, itemData.system, iconList);

                parsedCyberware.push(itemData);
            } catch (e) {
                console.error(e);
            }
        });

        return parsedCyberware;
    }

    parseCyberware(chummerCyber) {
        const parserType = 'cyberware';
        const system = {};
        system.description = parseDescription(chummerCyber);
        system.technology = parseTechnology(chummerCyber);

        // Cyberware has no equipped flag in chummer so it cannot be parsed - we consider it as always equipped
        system.technology.equipped = true;
        system.essence = chummerCyber.ess;
        system.grade = chummerCyber.grade;

        // Assign import flags
        system.importFlags = genImportFlags(formatAsSlug(chummerCyber.name_english), parserType);

        let subType = formatAsSlug(chummerCyber.category_english);
        if (Object.keys(SR5.itemSubTypeIconOverrides[parserType]).includes(subType)) {
            system.importFlags.subType = subType;
        }

        return createItemData(chummerCyber.name, parserType, system);
    }
}