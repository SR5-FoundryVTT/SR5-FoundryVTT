import { BaseGearParser } from "./BaseGearParser"

/**
 * Parses devices (commlinks and decks)
 */
export class DeviceParser extends BaseGearParser {
   
    parse(chummerGear : any) : any {
        const parsedGear =  super.parse(chummerGear);
        parsedGear.type = 'device';
        parsedGear.data.technology.rating = chummerGear.devicerating;

        parsedGear.data.atts = {
            att1:
            {
                value: chummerGear.attack,
                att: 'attack'
            },

            att2:
            {
                value: chummerGear.sleaze,
                att: 'sleaze'
            },

            att3:
            {
                value: chummerGear.dataprocessing,
                att: 'data_processing'
            },

            att4:
            {
                value: chummerGear.firewall,
                att: 'firewall'
            } 
        };

        if (chummerGear.category === 'Cyberdecks')
        {
            parsedGear.data.category = 'cyberdeck';
        }

        if (chummerGear.category === 'Commlinks')
        {
            parsedGear.data.category = 'commlink';
        }

        if (chummerGear.category === 'Rigger Command Consoles')
        {
            // We are handling rccs as commlinks for the moment since we have no support for rigger command consoles yet.
            parsedGear.data.category = 'commlink'; 
        }

        return parsedGear;
    }
}