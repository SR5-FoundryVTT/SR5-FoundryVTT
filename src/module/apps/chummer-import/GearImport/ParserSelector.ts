import { GearParser, BaseGearParser } from "./BaseGearParser";
import { SinParser } from "./SinParser";
import { DeviceParser } from "./DeviceParser";
import { ProgramParser } from "./ProgramParser";

/**
 * Responsible for selecting the correct GearParser depending on the gear.
 */
export class ParserSelector {

    /**
     * Selects the correct GearParser depending on the gear.
     * @param gearEntry The gear that needs to be parsed
     * The correct GearParser for this gear entry.
     */
    select(gearEntry : any) : GearParser {
        if (gearEntry.issin === 'True')
        {
            return new SinParser();
        }

        if (gearEntry.iscommlink === 'True')
        {
            return new DeviceParser();
        }

        if (gearEntry.category === 'Common Programs' ||
            gearEntry.category === 'Hacking Programs' ||
            gearEntry.category === 'Software')
        {
            return new ProgramParser();
        }

        return new BaseGearParser();
    }
}