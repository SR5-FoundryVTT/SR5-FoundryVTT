import { BaseGearParser } from "./BaseGearParser"

/**
 * Parses devices (commlinks and decks)
 */
export class DeviceParser extends BaseGearParser {
   
    parse(gearEntry : any) : any {
        const parsedGear =  super.parse(gearEntry);
        parsedGear.type = 'device';
        parsedGear.data.technology.rating = gearEntry.devicerating;
        parsedGear.data.technology.condition_monitor = 
        {
            value: 0,
            max: Number(gearEntry.conditionmonitor),
            label: ''
        };

        parsedGear.data.atts = {
            att1:
            {
                value: gearEntry.attack,
                att: 'attack'
            },

            att2:
            {
                value: gearEntry.sleaze,
                att: 'sleaze'
            },

            att3:
            {
                value: gearEntry.dataprocessing,
                att: 'data_processing'
            },

            att4:
            {
                value: gearEntry.firewall,
                att: 'firewall'
            } 
        };

        if (gearEntry.category === 'Cyberdecks')
        {
            parsedGear.data.category = 'cyberdeck';
        }

        if (gearEntry.category === 'Commlinks')
        {
            parsedGear.data.category = 'commlink';
        }

        if (gearEntry.category === 'Rigger Command Consoles')
        {
            // We are handling rccs as commlinks for the moment since we have no support for rigger command consoles yet.
            parsedGear.data.category = 'commlink'; 
        }

        return parsedGear;
    }
}