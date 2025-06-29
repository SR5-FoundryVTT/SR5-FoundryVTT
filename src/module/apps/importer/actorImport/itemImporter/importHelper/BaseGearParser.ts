import { parseDescription, parseTechnology, formatAsSlug, genImportFlags } from "./BaseParserFunctions.js"
import { DataDefaults } from "../../../../../data/DataDefaults.js";
import { SR5 } from "../../../../../config.js";
import { ActorSchema } from "../../ActorSchema.js";
import { Unwrap } from "../ItemsParser.js";

/**
 * Parses a certain class of gear (depending on the implementation).
 */
export interface GearParser {
    /**
     * Parses a gear entry and returns the corresponding foundry sr item data.
     * @param chummerGear A chummer gear entry
     */
    parse: (chummerGear: Unwrap<NonNullable<ActorSchema['gears']>['gear']>) => Item.CreateData;
}

/**
 * Base class for all gear parsers. Parses common information across all gear.
 */
export class BaseGearParser implements GearParser {
    parse(chummerGear: Unwrap<NonNullable<ActorSchema['gears']>['gear']>): Item.CreateData {
        const parsedGear = this.getDefaultData();
        const parserType = 'equipment';
        parsedGear.name = chummerGear.name;
        if (chummerGear.extra)
            parsedGear.name += ` (${chummerGear.extra})`;

        const system = parsedGear.system;

        system.technology = parseTechnology(chummerGear);
        system.description = parseDescription(chummerGear);

        // Assign import flags
        system.importFlags = genImportFlags(formatAsSlug(chummerGear.name), parserType);

        return parsedGear;
    }

    setSubType(parsedGear: any, parserType: string, subType: string) {
        if (Object.keys(SR5.itemSubTypeIconOverrides[parserType]).includes(subType)) {
            parsedGear.system.importFlags.subType = formatAsSlug(subType);
        }
    }

    private getDefaultData() {
        return DataDefaults.baseEntityData("equipment");
    }
}
