import { parseDescription, parseTechnology, formatAsSlug, genImportFlags } from "./BaseParserFunctions.js"
import { DataDefaults } from "../../../../../data/DataDefaults.js";
import { SR5 } from "../../../../../config.js";

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
        const parserType = 'equipment';
        parsedGear.name = chummerGear.name;
        if (chummerGear.extra)
            parsedGear.name += ` (${chummerGear.extra})`;

        const system = parsedGear.system as Item.SystemOfType<'equipment'>;

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
