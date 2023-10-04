import { BaseGearParser } from "./BaseGearParser"
import { iconAssign } from '../../iconAssigner/iconAssign';

/**
 * Parses common, hacking and agent programs.
 */
export class ProgramParser extends BaseGearParser {
    override parse(chummerGear : any) : any {
        const parsedGear =  super.parse(chummerGear);
        parsedGear.type = 'program';

        if (chummerGear.category === 'Common Programs')
        {
            parsedGear.system.type = 'common_program'
        }
        else if (chummerGear.category === 'Hacking Programs')
        {
            parsedGear.system.type = 'hacking_program'
        }
        else if (chummerGear.category === 'Software')
        {
            parsedGear.system.type = 'agent'
        }

        return parsedGear;
    }
}