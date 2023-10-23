import { parseDescription, createItemData } from "./BaseParserFunctions";

export default class SimpleParser {
    async parseCollection(parsingCollection, parserType) {
        const parsed = [];

        parsingCollection.forEach(async (toParse) => {
            try {
                const itemData = this.parseItem(toParse, parserType);
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

        return createItemData(toParse.fullname, parserType, system);
    }
}