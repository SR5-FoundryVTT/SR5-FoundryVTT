import { parseDescription, getArray, createItemData, formatAsSlug, genImportFlags, setSubType } from "../importHelper/BaseParserFunctions.js"
import * as IconAssign from '../../iconAssigner/iconAssign.js';

export class QualityParser {

    async parseQualities(chummerChar, assignIcons) {
        const qualities = getArray(chummerChar.qualities.quality);
        const parsedQualities = [];
        const iconList = await IconAssign.getIconFiles();

        await qualities.forEach(async (chummerQuality) => {
            try {
                const itemData = this.parseQuality(chummerQuality);

                // Assign the icon if enabled
                if (assignIcons) {itemData.img = await IconAssign.iconAssign(itemData.system.importFlags, itemData.system, iconList)};

                parsedQualities.push(itemData);
            } catch (e) {
                console.error(e);
            }
        });

        return parsedQualities;
    }

    parseQuality(chummerQuality) {
        const parserType = 'quality';
        const system = {};
        system.type = chummerQuality.qualitytype_english.toLowerCase();
        system.rating = parseInt(chummerQuality.extra) || 0;
        system.description = parseDescription(chummerQuality);

        // Assign import flags
        system.importFlags = genImportFlags(formatAsSlug(chummerQuality.name_english), parserType);
        setSubType(system, parserType, formatAsSlug(system.type)); // positive or negative

        // Create the item
        let quality = createItemData(chummerQuality.name, parserType, system);

        return quality;
    }
}