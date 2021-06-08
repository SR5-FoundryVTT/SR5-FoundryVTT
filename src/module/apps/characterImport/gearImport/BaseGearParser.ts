import { DefaultValues } from "../../../dataTemplates";
import { parseDescription, parseTechnology } from "../BaseParserFunctions.js"
import EquipmentItemData = Shadowrun.EquipmentItemData;


/**
 * Parses a certain class of gear (depending on the implementation).
 */
export interface GearParser {
    /**
     * Parses a gear entry and returns the corresponding foundry sr item data.
     * @param chummerGear A chummer gear entry
     */
    parse(chummerGear : any) : any
}

/**
 * Base class for all gear parsers. Parses common information across all gear.
 */
export class BaseGearParser implements GearParser {
    parse(chummerGear : any) : any {
        const parsedGear = this.getDefaultData();
        parsedGear.name = chummerGear.name;
        if (chummerGear.extra)
        {
            parsedGear.name += ` (${chummerGear.extra})`;
        }

        parsedGear.data.technology = parseTechnology(chummerGear);
        parsedGear.data.description = parseDescription(chummerGear);

        return parsedGear;
    }

    private getDefaultData() : EquipmentItemData {
        return {
            name: '',
            _id: '',
            folder: '',
            flags: {},
            img: 'icons/svg/mystery-man.svg',
            type: 'equipment',
            data: DefaultValues.equipmentData(),
            permission: {
                default: 2,
            },
            effects: [],
            sort: 0
        };
    }
}

