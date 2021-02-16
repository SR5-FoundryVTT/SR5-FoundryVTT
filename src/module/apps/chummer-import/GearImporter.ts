import { ParserSelector } from "./ParserSelector";

/**
 * Parses all gear from a chummer character file and turns them into foundry sr item data objects
 */
export class GearImporter {

    /**
     * Parses all chummer gear entries
     * @param gears Array of chummer gear entries
     */
    parseAllGear(gears : any) : any {
        let items : any[] = [];

        gears.forEach((g) => {
            const itemsData = this.parseGearEntry(g);
            items.push(itemsData);
        });

        return items;
    }

    private parseGearEntry(g : any) : any {
        const parserSelector = new ParserSelector();
        const parser = parserSelector.select(g);
        return parser.parse(g);
    }
}
