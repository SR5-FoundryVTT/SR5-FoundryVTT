import { parseDescription, getArray, createItemData } from "./BaseParserFunctions.js"
import { DataDefaults } from "../../data/DataDefaults";

export class QualityParser {

    parseQualities(chummerChar) {
        const qualities = getArray(chummerChar.qualities.quality);
        const parsedQualities = [];

        qualities.forEach((chummerQuality) => {
            try {
                const itemData = this.parseQuality(chummerQuality);
                parsedQualities.push(itemData);
            } catch (e) {
                console.error(e);
            }
        });

        return parsedQualities;
    }

    parseQuality(chummerQuality) {
        const system = DataDefaults.baseItemData({type: 'quality'});
        system.type = chummerQuality.qualitytype.toLowerCase();
        system.description = parseDescription(chummerQuality);

        return createItemData(chummerQuality.name, 'quality', system);
    }
}