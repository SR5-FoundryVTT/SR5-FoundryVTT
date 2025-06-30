import { DataDefaults } from "src/module/data/DataDefaults";
import { BaseGearParser } from "../importHelper/BaseGearParser"
import { formatAsSlug, genImportFlags, parseDescription, parseTechnology } from "../importHelper/BaseParserFunctions.js"
import { ActorSchema } from "../../ActorSchema";
import { Unwrap } from "../ItemsParser";

/**
 * Parses common, hacking and agent programs.
 */
export class ProgramParser extends BaseGearParser {
    override parse(chummerGear: Unwrap<NonNullable<ActorSchema['gears']>['gear']>) : any {
        const parserType = 'program';
        const parsedGear = {
            name: chummerGear.name || 'Unnamed',
            type: parserType,
            system: DataDefaults.baseSystemData(parserType)
        } satisfies Item.CreateData;

        const system = parsedGear.system;

        system.technology = parseTechnology(chummerGear);
        system.description = parseDescription(chummerGear);

        // Assign import flags
        system.importFlags = genImportFlags(formatAsSlug(chummerGear.name), parserType);


        parsedGear.type = parserType;

        if (chummerGear.category_english === 'Common Programs')
            parsedGear.system.type = 'common_program'
        else if (chummerGear.category_english === 'Hacking Programs')
            parsedGear.system.type = 'hacking_program'
        else if (chummerGear.category_english === 'Software')
            parsedGear.system.type = 'agent'

        // Assign import flags
        parsedGear.system.importFlags = genImportFlags(formatAsSlug(chummerGear.name_english), parserType);
        this.setSubType(parsedGear, parserType, parsedGear.system.type);

        return parsedGear;
    }
}
