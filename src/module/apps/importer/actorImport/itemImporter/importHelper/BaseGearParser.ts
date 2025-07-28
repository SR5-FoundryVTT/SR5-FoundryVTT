import { parseDescription, parseTechnology, formatAsSlug, genImportFlags } from "./BaseParserFunctions"
import { DataDefaults } from "../../../../../data/DataDefaults";
import { ActorSchema } from "../../ActorSchema";
import { SR5 } from "../../../../../config";
import { Unwrap } from "../ItemsParser";

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
        const parserType = 'equipment';
        const parsedGear = {
            name: chummerGear.name || 'Unnamed',
            type: parserType,
            system: DataDefaults.baseSystemData(parserType)
        } satisfies Item.CreateData;

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
}
