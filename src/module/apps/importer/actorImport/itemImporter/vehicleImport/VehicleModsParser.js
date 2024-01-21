import { parseDescription, getArray, parseTechnology, createItemData, formatAsSlug, genImportFlags, setSubType } from "../importHelper/BaseParserFunctions.js"
import * as IconAssign from '../../../../iconAssigner/iconAssign.js';

export default class VehicleModsParser {

    async parseMods(vehicle, assignIcons) {
        const mods = getArray(vehicle.mods?.mod);
        let parsed = []

        const iconList = await IconAssign.getIconFiles();
        mods.forEach(async (toParse) => {
            try {
                const itemData = this.parseMod(toParse);

                // Assign the icon if enabled
                if (assignIcons) {itemData.img = await IconAssign.iconAssign(itemData.system.importFlags, itemData.system, iconList)};

                parsed.push(itemData);
            } catch (e) {
                console.error(e);
            }
        });
       

        return parsed;
    }

    parseMod(mod) {
        const parserType = 'modification';
        const system = {};

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