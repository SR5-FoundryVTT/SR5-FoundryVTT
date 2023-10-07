import { BaseGearParser } from "./BaseGearParser"

/**
 * Parses devices (commlinks, decks, and RCCs)
 */
export class DeviceParser extends BaseGearParser {
   
    override parse(chummerGear : any) : any {
        const parsedGear =  super.parse(chummerGear);
        parsedGear.type = 'device';
        parsedGear.system.technology.rating = chummerGear.devicerating;

        parsedGear.system.atts = {
            att1:
            {
                value: parseInt(chummerGear.attack),
                att: 'attack'
            },

            att2:
            {
                value: parseInt(chummerGear.sleaze),
                att: 'sleaze'
            },

            att3:
            {
                value: parseInt(chummerGear.dataprocessing),
                att: 'data_processing'
            },

            att4:
            {
                value: parseInt(chummerGear.firewall),
                att: 'firewall'
            } 
        };

        if (chummerGear.category === 'Cyberdecks')
        {
            parsedGear.system.category = 'cyberdeck';
        }

        if (chummerGear.category === 'Commlinks')
        {
            parsedGear.system.category = 'commlink';
        }

        if (chummerGear.category === 'Rigger Command Consoles')
        {
            parsedGear.system.category = 'rcc';
        }

        return parsedGear;
    }
}