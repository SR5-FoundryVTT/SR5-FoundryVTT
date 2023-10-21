import { ParserSelector } from "./ParserSelector";
import * as IconAssign from '../../iconAssigner/iconAssign';

/**
 * Parses all gear from a chummer character file and turns them into foundry sr item data objects
 */
export class GearsParser {

    /**
     * Parses all chummer gear entries
     * @param chummerGears Array of chummer gear entries
     */
    async parseGears(chummerGears : any, assignIcons : boolean) : Promise<any> {
        let items : any[] = [];
        const iconList = await IconAssign.getIconFiles();

        chummerGears.forEach(async (chummerGear) => {
            try {
                // First filter out gear entries, that we do not want to handle.
                if (!this.gearShouldBeParsed(chummerGear)) {
                    return;
                }

                const itemData = this.parseGearEntry(chummerGear);

                // Assign the icon if enabled
                if (assignIcons) {itemData.img = await IconAssign.iconAssign(itemData.system.importFlags, itemData.system, iconList)};

                items.push(itemData);
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
