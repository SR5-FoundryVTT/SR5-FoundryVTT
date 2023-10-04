import { parseDescription, getArray, createItemData, formatAsSlug, genImportFlags } from "./BaseParserFunctions.js"
import { DataDefaults } from "../../data/DataDefaults";
import * as IconAssign from '../../apps/iconAssigner/iconAssign';
import { SR5 } from "../../config";

export class QualityParser {

    async parseQualities(chummerChar, assignIcons) {
        const qualities = getArray(chummerChar.qualities.quality);
        const parsedQualities = [];
        const iconList = await IconAssign.getIconFiles();

        await qualities.forEach(async (chummerQuality) => {
            try {
                const itemData = this.parseQuality(chummerQuality);

                // Assign the icon if enabled
                if (assignIcons) itemData.img = await IconAssign.iconAssign(itemData.system.system.importFlags, itemData.system.system, iconList);

                parsedQualities.push(itemData);
            } catch (e) {
                console.error(e);
            }
        });

        return parsedQualities;
    }

    parseQuality(chummerQuality) {
        const parserType = 'quality';
        const system = DataDefaults.baseItemData({type: parserType});
        system.type = chummerQuality.qualitytype.toLowerCase();
        system.description = parseDescription(chummerQuality);

        // Assign import flags
        system.system.importFlags = genImportFlags(formatAsSlug(chummerQuality.name_english), parserType);

        // Assign item subtype
        let subType = formatAsSlug(system.type); // positive or negative
        if (Object.keys(SR5.itemSubTypeIconOverrides[parserType]).includes(subType)) {
            system.system.importFlags.subType = subType;
        }

        // Create the item
        let quality = createItemData(chummerQuality.name, parserType, system);

        return quality;
    }
}