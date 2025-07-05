import { parseDescription, getArray, parseTechnology, createItemData, formatAsSlug, genImportFlags, setSubType } from "../importHelper/BaseParserFunctions.js"
import * as IconAssign from '../../../../iconAssigner/iconAssign.js';
import { ActorSchema } from "../../ActorSchema.js";
import { Unwrap } from "../ItemsParser.js";
import { DataDefaults } from "src/module/data/DataDefaults.js";

type VehicleType = Unwrap<NonNullable<ActorSchema['vehicles']>['vehicle']>;
type VehicleModType = Unwrap<NonNullable<VehicleType['mods']>['mod']>;

export default class VehicleModsParser {
    async parseMods(vehicle: VehicleType, assignIcons: boolean = false) {
        const mods = getArray(vehicle.mods?.mod);
        const parsed: Item.CreateData[] = [];

        const iconList = await IconAssign.getIconFiles();
        for (const toParse of mods) {
            try {
                const itemData = this.parseMod(toParse);

                // Assign the icon if enabled
                if (assignIcons)
                    itemData.img = IconAssign.iconAssign(itemData.system.importFlags, iconList, itemData.system);

                parsed.push(itemData);
            } catch (e) {
                console.error(e);
            }
        };
       

        return parsed;
    }

    parseMod(mod: VehicleModType) {
        const parserType = 'modification';
        const system = DataDefaults.baseSystemData(parserType);

        system.type = 'vehicle';
        system.description = parseDescription(mod);
        system.technology = parseTechnology(mod);

       // Assign import flags
       system.importFlags = genImportFlags(formatAsSlug(mod.name_english), parserType);
       setSubType(system, parserType, formatAsSlug(mod.category_english));

        // Create the item
        const itemData = createItemData(mod.name, parserType, system);

        return itemData;
    }
}