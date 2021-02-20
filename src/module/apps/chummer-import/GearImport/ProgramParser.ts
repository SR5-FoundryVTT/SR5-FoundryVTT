import { BaseGearParser } from "./BaseGearParser"

/**
 * Parses common, hacking and agent programs.
 */
export class ProgramParser extends BaseGearParser {
    parse(gearEntry : any) : any {
        const parsedGear =  super.parse(gearEntry);
        parsedGear.type = 'program';

        if (gearEntry.category === 'Common Programs')
        {
            parsedGear.data.type = 'common_program'
        }
        else if (gearEntry.category === 'Hacking Programs')
        {
            parsedGear.data.type = 'hacking_program'
        } 
        else if (gearEntry.category === 'Software')
        {
            parsedGear.data.type = 'agent'
        }

        return parsedGear;
    }
}