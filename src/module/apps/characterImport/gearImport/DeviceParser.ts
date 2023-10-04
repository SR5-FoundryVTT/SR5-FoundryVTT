import { BaseGearParser } from "./BaseGearParser"
import { iconAssign } from '../../iconAssigner/iconAssign';

/**
 * Parses devices (commlinks and decks)
 */
export class DeviceParser extends BaseGearParser {

    override parse(chummerGear : any) : any {
        const parsedGear =  super.parse(chummerGear);
        parsedGear.type = 'device';
        parsedGear.system.technology.rating = chummerGear.devicerating;

        parsedGear.system.atts = {
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
                value: chummerGear.systemprocessing,
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
            parsedGear.system.category = 'cyberdeck';
        }

        if (chummerGear.category === 'Commlinks')
        {
            parsedGear.system.category = 'commlink';
        }

        if (chummerGear.category === 'Rigger Command Consoles')
        {
            // We are handling rccs as commlinks for the moment since we have no support for rigger command consoles yet.
            parsedGear.system.category = 'commlink';
        }

        return parsedGear;
    }
}