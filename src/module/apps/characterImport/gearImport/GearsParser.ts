import { ParserSelector } from "./ParserSelector";

/**
 * Parses all gear from a chummer character file and turns them into foundry sr item data objects
 */
export class GearsParser {

    /**
     * Parses all chummer gear entries
     * @param chummerGears Array of chummer gear entries
     */
    parseGears(chummerGears : any) : any {
        let items : any[] = [];

        chummerGears.forEach((chummerGear) => {
            try {
                // First filter out gear entries, that we do not want to handle.
                if (!this.gearShouldBeParsed(chummerGear)) {
                    return;
                }

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

    private gearShouldBeParsed(chummerGear : any) : boolean {
        // We do not handle grenades and rockets here since they are also in the weapons section with more info.
        const englishGearName = (chummerGear.name_english as string).toLowerCase();
        if (englishGearName.startsWith('grenade') || 
            englishGearName.startsWith('minigrenade') || 
            englishGearName.startsWith('rocket'))
        {
            return false;
        }

        return true;
    }
}
