import { ParserSelector } from "./ParserSelector";

/**
 * Parses all gear from a chummer character file and turns them into foundry sr item data objects
 */
export class GearsParser {

    /**
     * Parses all chummer gear entries
     * @param chummerGears Array of chummer gear entries
     */
    parseAllGear(chummerGears : any) : any {
        let items : any[] = [];

        chummerGears.forEach((chummerGear) => {
            try {
                const itemsData = this.parseGearEntry(chummerGear);
                items.push(itemsData);
            }

            catch (e) {
                console.error(e);
            }
        });

        return items;
    }

    private parseGearEntry(chummerGear : any) : any {
        const parserSelector = new ParserSelector();
        const parser = parserSelector.select(chummerGear);
        return parser.parse(chummerGear);
    }
}
