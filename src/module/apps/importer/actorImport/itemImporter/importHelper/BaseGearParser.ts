import { formatAsSlug } from "./BaseParserFunctions"
import { SR5 } from "../../../../../config";

/**
 * Base class for all gear parsers. Parses common information across all gear.
 */
export class BaseGearParser {

    setSubType(parsedGear: any, parserType: string, subType: string) {
        if (Object.keys(SR5.itemSubTypeIconOverrides[parserType]).includes(subType)) {
            parsedGear.system.importFlags.subType = formatAsSlug(subType);
        }
    }
}
