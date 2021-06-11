import { parseDescription, getArray, createItemData } from "./BaseParserFunctions.js"
import { DefaultValues } from "../../data/DataDefaults";

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
        const data = DefaultValues.qualityData();
        data.type = chummerQuality.qualitytype.toLowerCase();
        data.description = parseDescription(chummerQuality);

        const itemData = createItemData(chummerQuality.name, 'quality', data);
        return itemData;
    }
}