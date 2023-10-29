import { parseDescription, createItemData, genImportFlags, formatAsSlug } from "./BaseParserFunctions";
import * as IconAssign from '../../iconAssigner/iconAssign.js';

export default class SimpleParser {
    async parseCollection(parsingCollection, parserType, assignIcons) {
        const parsed = [];
        const iconList = await IconAssign.getIconFiles();

        parsingCollection.forEach(async (toParse) => {
            try {
                const itemData = this.parseItem(toParse, parserType);

                // Assign the icon if enabled
                if (assignIcons) {itemData.img = await IconAssign.iconAssign(itemData.system.importFlags, itemData.system, iconList)};

                parsed.push(itemData);
            } catch (e) {
                console.error(e);
            }
        });

        return parsed;
    }

    parseItem(toParse, parserType) {
        const system = {};
        system.description = parseDescription(toParse);

        // Assign import flags
        system.importFlags = genImportFlags(formatAsSlug(toParse.name_english), parserType);

        return createItemData(toParse.fullname, parserType, system);
    }
}