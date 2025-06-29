import { DataDefaults } from "src/module/data/DataDefaults";
import { ActorSchema } from "../../ActorSchema";
import { BaseGearParser } from "../importHelper/BaseGearParser"
import { formatAsSlug, genImportFlags, parseDescription, parseTechnology } from "../importHelper/BaseParserFunctions.js"
import { Unwrap } from "../ItemsParser";

/**
 * Parses devices (commlinks, decks, and RCCs)
 */
export class DeviceParser extends BaseGearParser {

    override parse(chummerGear: Unwrap<NonNullable<ActorSchema['gears']>['gear']>): Item.CreateData {
        const parserType = 'device';
        const parsedGear = DataDefaults.baseEntityData("device");

        const system = parsedGear.system;

        system.technology = parseTechnology(chummerGear);
        system.description = parseDescription(chummerGear);

        // Assign import flags
        system.importFlags = genImportFlags(formatAsSlug(chummerGear.name), parserType);

        parsedGear.system.technology.rating = Number(chummerGear.devicerating) || 0;

        parsedGear.system.atts.att1.value = Number(chummerGear.attack) || 0;
        parsedGear.system.atts.att2.value = Number(chummerGear.sleaze) || 0;
        parsedGear.system.atts.att3.value = Number(chummerGear.dataprocessing) || 0;
        parsedGear.system.atts.att4.value = Number(chummerGear.firewall) || 0;
        
        parsedGear.system.atts.att1.att = 'attack';
        parsedGear.system.atts.att2.att = 'sleaze';
        parsedGear.system.atts.att3.att = 'data_processing';
        parsedGear.system.atts.att4.att = 'firewall';

        // Map Chummer gear categories to internal system categories
        const categoryMap = {
            'Cyberdecks': 'cyberdeck',
            'Commlinks': 'commlink',
            'Rigger Command Consoles': 'rcc',
             // Chummer has prepaid commlinks set up as Entertainment category
            'Entertainment': 'commlink',
        } as const;

        const mappedCategory = categoryMap[chummerGear.category_english as keyof typeof categoryMap];
        if (mappedCategory) {
            parsedGear.system.category = mappedCategory;
        }

        // Assign import flags
        parsedGear.system.importFlags = genImportFlags(formatAsSlug(chummerGear.name_english), parserType);
        this.setSubType(parsedGear, parserType, parsedGear.system.category);

        return parsedGear;
    }
}