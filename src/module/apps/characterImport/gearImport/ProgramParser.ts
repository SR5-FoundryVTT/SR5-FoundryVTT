import { BaseGearParser } from "./BaseGearParser"

/**
 * Parses common, hacking and agent programs.
 */
export class ProgramParser extends BaseGearParser {
    parse(chummerGear : any) : any {
        const parsedGear =  super.parse(chummerGear);
        parsedGear.type = 'program';

        if (chummerGear.category === 'Common Programs')
        {
            parsedGear.data.type = 'common_program'
        }
        else if (chummerGear.category === 'Hacking Programs')
        {
            parsedGear.data.type = 'hacking_program'
        } 
        else if (chummerGear.category === 'Software')
        {
            parsedGear.data.type = 'agent'
        }

        return parsedGear;
    }
}