import { BaseGearParser } from "../importHelper/BaseGearParser"
import { formatAsSlug, genImportFlags } from "../importHelper/BaseParserFunctions.js"

/**
 * Parses devices (commlinks, decks, and RCCs)
 */
export class DeviceParser extends BaseGearParser {

    override parse(chummerGear : any) : any {
        const parserType = 'device';
        const parsedGear =  super.parse(chummerGear);
        parsedGear.type = parserType;
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

        if (chummerGear.category_english === 'Cyberdecks')
        {
            parsedGear.system.category = 'cyberdeck';
        }

        if (chummerGear.category_english === 'Commlinks')
        {
            parsedGear.system.category = 'commlink';
        }

        if (chummerGear.category_english === 'Rigger Command Consoles')
        {
            parsedGear.system.category = 'rcc';
        }
        if (chummerGear.category_english === 'Entertainment')
        {
            // Chummer has prepaid commlinks set up as Entertainment category
            parsedGear.system.category = 'commlink';
        }

        // Assign import flags
        parsedGear.system.importFlags = genImportFlags(formatAsSlug(chummerGear.name_english), parserType);
        this.setSubType(parsedGear, parserType, parsedGear.system.category);

        return parsedGear;
    }
}