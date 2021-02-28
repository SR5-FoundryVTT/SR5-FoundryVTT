import { GearParser, BaseGearParser } from "./BaseGearParser";
import { SinParser } from "./SinParser";
import { DeviceParser } from "./DeviceParser";
import { ProgramParser } from "./ProgramParser";
import { AmmoParser } from "./AmmoParser";

/**
 * Responsible for selecting the correct GearParser depending on the gear.
 */
export class ParserSelector {

    /**
     * Selects the correct GearParser depending on the gear.
     * @param chummerGear The gear that needs to be parsed
     * The correct GearParser for this gear entry.
     */ 
    select(chummerGear : any) : GearParser {
        if (chummerGear.issin === 'True')
        {
            return new SinParser();
        }

        if (chummerGear.iscommlink === 'True')
        {
            return new DeviceParser();
        }

        if (chummerGear.isammo === 'True')
        {
            return new AmmoParser();
        }

        if (chummerGear.category === 'Common Programs' || 
            chummerGear.category === 'Hacking Programs' || 
            chummerGear.category === 'Software')
        {
            return new ProgramParser();
        }

        return new BaseGearParser();
    }
}