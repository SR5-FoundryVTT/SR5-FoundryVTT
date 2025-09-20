import { BaseGearParser } from "./BaseGearParser";
import { SinParser } from "../bioImport/SinParser";
import { DeviceParser } from "../matrixImport/DeviceParser";
import { ProgramParser } from "../matrixImport/ProgramParser";
import { AmmoParser } from "../weaponImport/AmmoParser";
import { ActorSchema } from "../../ActorSchema";
import { Unwrap } from "../ItemsParser";

/**
 * Responsible for selecting the correct GearParser depending on the gear.
 */
export class ParserSelector {

    /**
     * Selects the correct GearParser depending on the gear.
     * @param chummerGear The gear that needs to be parsed
     * The correct GearParser for this gear entry.
     */ 
    select(chummerGear: Unwrap<NonNullable<ActorSchema['gears']>['gear']>) {
        if (chummerGear.issin === 'True')
            return new SinParser();

        if (chummerGear.iscommlink === 'True')
            return new DeviceParser();

        if (chummerGear.isammo === 'True')
            return new AmmoParser();

        if (chummerGear.category_english === 'Common Programs' || 
            chummerGear.category_english === 'Hacking Programs' || 
            chummerGear.category_english === 'Software')
            return new ProgramParser();

        return new BaseGearParser();
    }
}
