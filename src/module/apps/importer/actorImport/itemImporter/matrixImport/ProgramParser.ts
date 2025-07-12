import { formatAsSlug, genImportFlags } from "../importHelper/BaseParserFunctions";
import { BaseGearParser } from "../importHelper/BaseGearParser";
import { ActorSchema } from "../../ActorSchema";
import { Unwrap } from "../ItemsParser";

/**
 * Parses common, hacking and agent programs.
 */
export class ProgramParser extends BaseGearParser {
    override parse(chummerGear: Unwrap<NonNullable<ActorSchema['gears']>['gear']>) {
        const parserType = 'program';
        const parsedGear = super.parse(chummerGear) as unknown as Shadowrun.ProgramItemData;
        parsedGear.type = parserType;

        if (chummerGear.category_english === 'Common Programs')
            parsedGear.system.type = 'common_program'
        else if (chummerGear.category_english === 'Hacking Programs')
            parsedGear.system.type = 'hacking_program'
        // else if (chummerGear.category_english === 'Software')
        //     parsedGear.system.type = 'agent'

        // Assign import flags
        parsedGear.system.importFlags = genImportFlags(formatAsSlug(chummerGear.name_english), parserType);
        this.setSubType(parsedGear, parserType, parsedGear.system.type);

        return parsedGear;
    }
}
