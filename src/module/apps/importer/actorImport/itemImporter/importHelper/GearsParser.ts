import * as IconAssign from '../../../../iconAssigner/iconAssign';
import { ParserSelector } from "./ParserSelector";
import { ActorSchema } from "../../ActorSchema";
import { Unwrap } from "../ItemsParser";

/**
 * Parses all gear from a chummer character file and turns them into foundry sr item data objects
 */
export class GearsParser {

    /**
     * Parses all chummer gear entries
     * @param chummerGears Array of chummer gear entries
     */
    async parseGears(chummerGears: Unwrap<NonNullable<ActorSchema['gears']>['gear']>[], assignIcons: boolean = false) {
        const items: Item.CreateData[] = [];
        const iconList = await IconAssign.getIconFiles();

        for (const chummerGear of chummerGears) {
            try {
                // First filter out gear entries, that we do not want to handle.
                if (!this.gearShouldBeParsed(chummerGear)) {
                    return;
                }

                const itemData = this.parseGearEntry(chummerGear);

                // Assign the icon if enabled
                if (assignIcons)
                    itemData.img = IconAssign.iconAssign(itemData.system.importFlags, iconList, itemData.system);

                items.push(itemData);
            }

            catch (e) {
                console.error(e);
            }
        };

        return items;
    }

    private parseGearEntry(chummerGear: Unwrap<NonNullable<ActorSchema['gears']>['gear']>) {
        const parserSelector = new ParserSelector();
        const parser = parserSelector.select(chummerGear);
        return parser.parse(chummerGear);
    }

    private gearShouldBeParsed(chummerGear: Unwrap<NonNullable<ActorSchema['gears']>['gear']>): boolean {
        // We do not handle grenades and rockets here since they are also in the weapons section with more info.
        const englishGearName = (chummerGear.name_english).toLowerCase();
        if (englishGearName.startsWith('grenade') ||
            englishGearName.startsWith('minigrenade') ||
            englishGearName.startsWith('rocket'))
        {
            return false;
        }

        return true;
    }
}
