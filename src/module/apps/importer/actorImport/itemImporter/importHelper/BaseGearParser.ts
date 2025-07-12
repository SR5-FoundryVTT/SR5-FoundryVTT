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
    parse: (chummerGear: Unwrap<NonNullable<ActorSchema['gears']>['gear']>) => any
}

/**
 * Base class for all gear parsers. Parses common information across all gear.
 */
export class BaseGearParser implements GearParser {
    parse(chummerGear: Unwrap<NonNullable<ActorSchema['gears']>['gear']>): any {
        const parsedGear = this.getDefaultData();
        const parserType = 'equipment';
        parsedGear.name = chummerGear.name;
        if (chummerGear.extra)
        {
            parsedGear.name += ` (${chummerGear.extra})`;
        }

        parsedGear.system.technology = parseTechnology(chummerGear);
        parsedGear.system.description = parseDescription(chummerGear);

        // Assign import flags
        parsedGear.system.importFlags = genImportFlags(formatAsSlug(chummerGear.name), parserType);

        return parsedGear;
    }

    setSubType(parsedGear: any, parserType: string, subType: string) {
        if (Object.keys(SR5.itemSubTypeIconOverrides[parserType]).includes(subType)) {
            parsedGear.system.importFlags.subType = formatAsSlug(subType);
        }
    }

    private getDefaultData() {
        return DataDefaults.baseEntityData<Shadowrun.EquipmentItemData, Shadowrun.EquipmentData>("Item", {type: 'equipment'});
    }
}
