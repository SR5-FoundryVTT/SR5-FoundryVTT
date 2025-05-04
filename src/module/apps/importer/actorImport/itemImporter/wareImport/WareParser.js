import { parseDescription, getArray, parseTechnology, createItemData, formatAsSlug, genImportFlags, setSubType } from "../importHelper/BaseParserFunctions.js"
import * as IconAssign from '../../../../iconAssigner/iconAssign.js';

export class WareParser {

    async parseWares(chummerChar, assignIcons) {
        const chummerWares = getArray(chummerChar.cyberwares.cyberware);
        const parsedWare = [];
        const iconList = await IconAssign.getIconFiles();

        await chummerWares.forEach( async (chummerWare) => {
            try {
                const itemData = this.parseWare(chummerWare);

                // Assign the icon if enabled
                if (assignIcons) {itemData.img = await IconAssign.iconAssign(itemData.system.importFlags, itemData.system, iconList)};

                parsedWare.push(itemData);
            } catch (e) {
                console.error(e);
            }
        });

        return parsedWare;
    }

    parseWare(chummerWare) {
        // set based on if this is cyberware or bioware
        let parserType = chummerWare.improvementsource.toLowerCase();
        if (!['cyberware', 'bioware'].includes(parserType)) {parserType = 'cyberware'}; //default to cyberware if no match
        const system = {};
        system.description = parseDescription(chummerWare);
        system.technology = parseTechnology(chummerWare);

        // Cyberware and Bioware have no equipped flag in chummer so it cannot be parsed - we consider it as always equipped
        system.technology.equipped = true;
        system.essence = chummerWare.ess;        
        system.grade = chummerWare.grade;

        // Bioware has no wireless feature, so disable it by default
        if (parserType == 'bioware') {
            system.technology.wireless = false;
        }

        // Assign import flags
        system.importFlags = genImportFlags(formatAsSlug(chummerWare.name_english), parserType);
        setSubType(system, parserType, formatAsSlug(chummerWare.category_english));

        return createItemData(chummerWare.name, parserType, system);
    }
}