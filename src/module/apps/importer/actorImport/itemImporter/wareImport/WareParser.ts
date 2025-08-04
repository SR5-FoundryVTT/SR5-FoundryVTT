import { parseDescription, getArray, parseTechnology, createItemData, formatAsSlug, genImportFlags, setSubType } from "../importHelper/BaseParserFunctions";
import * as IconAssign from '../../../../iconAssigner/iconAssign';
import { DataDefaults } from "src/module/data/DataDefaults";
import { ActorSchema } from "../../ActorSchema";
import { Unwrap } from "../ItemsParser";

export class WareParser {

    async parseWares(chummerChar: ActorSchema, assignIcons: boolean = false) {
        const chummerWares = getArray(chummerChar.cyberwares?.cyberware);
        const parsedWare: Item.CreateData[] = [];
        const iconList = await IconAssign.getIconFiles();

        for (const chummerWare of chummerWares) {
            try {
                const itemData = this.parseWare(chummerWare);

                // Assign the icon if enabled
                if (assignIcons)
                    itemData.img = IconAssign.iconAssign(itemData.system.importFlags, iconList, itemData.system);

                parsedWare.push(itemData);
            } catch (e) {
                console.error(e);
            }
        };

        return parsedWare;
    }

    parseWare(chummerWare: Unwrap<NonNullable<ActorSchema['cyberwares']>['cyberware']>) {
        // set based on if this is cyberware or bioware
        let parserType = chummerWare.improvementsource.toLowerCase() as 'cyberware' | 'bioware';
        if (!['cyberware', 'bioware'].includes(parserType)) { parserType = 'cyberware' }; //default to cyberware if no match
        const system = DataDefaults.baseSystemData(parserType);
        system.description = parseDescription(chummerWare);
        system.technology = parseTechnology(chummerWare);

        // Cyberware and Bioware have no equipped flag in chummer so it cannot be parsed - we consider it as always equipped
        system.technology.equipped = true;
        system.essence = Number(chummerWare.ess) || 0;
        system.grade = chummerWare.grade.toLowerCase() as 'standard' | 'alpha' | 'beta' | 'delta' | 'gamma';

        // Bioware has no wireless feature, so disable it by default
        if (parserType === 'bioware') {
            system.technology.wireless = 'none';
        }

        // Assign import flags
        system.importFlags = genImportFlags(formatAsSlug(chummerWare.name_english), parserType);
        setSubType(system, parserType, formatAsSlug(chummerWare.category_english));

        return createItemData(chummerWare.name, parserType, system);
    }
}
