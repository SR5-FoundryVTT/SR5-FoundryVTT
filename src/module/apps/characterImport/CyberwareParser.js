import { parseDescription, getArray, parseTechnology, createItemData, formatAsSlug, genImportFlags, setSubType } from "./BaseParserFunctions.js"
import * as IconAssign from '../../apps/iconAssigner/iconAssign';

export class CyberwareParser {

    async parseCyberwares(chummerChar, assignIcons) {
        const chummerCyberwares = getArray(chummerChar.cyberwares.cyberware);
        const parsedCyberware = [];
        const iconList = await IconAssign.getIconFiles();

        await chummerCyberwares.forEach( async (chummerCyber) => {
            try {
                const itemData = this.parseCyberware(chummerCyber);

                // Assign the icon if enabled
                if (assignIcons) {itemData.img = await IconAssign.iconAssign(itemData.system.importFlags, itemData.system, iconList)};

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
        setSubType(system, parserType, formatAsSlug(chummerCyber.category_english));

        return createItemData(chummerCyber.name, parserType, system);
    }
}