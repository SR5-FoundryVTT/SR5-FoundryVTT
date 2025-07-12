import { parseDescription, getArray, parseTechnology, createItemData, formatAsSlug, genImportFlags, setSubType } from "../importHelper/BaseParserFunctions.js"
import * as IconAssign from '../../../../iconAssigner/iconAssign.js';
import { DataDefaults } from "src/module/data/DataDefaults.js";
import { ActorSchema } from "../../ActorSchema.js";
import { Unwrap } from "../ItemsParser.js";

export class ArmorParser {

    async parseArmors(chummerChar: ActorSchema, assignIcons: boolean = false) {
        const armors = getArray(chummerChar.armors?.armor);
        const parsedArmors: Item.CreateData[] = [];
        const iconList = await IconAssign.getIconFiles();

        for (const chummerArmor of armors) {
            try {
                const itemData = this.parseArmor(chummerArmor);

                // Assign the icon if enabled
                if (assignIcons)
                    itemData.img = IconAssign.iconAssign(itemData.system.importFlags, iconList, itemData.system);

                parsedArmors.push(itemData);
            } catch (e) {
                console.error(e);
            }
        };

        const otherArmors = getArray(chummerChar.otherarmors?.otherarmor)

        for (const chummerArmor of otherArmors) {
            try {
                const itemData = this.parseOtherArmor(chummerArmor);

                // Assign the icon if enabled
                if (assignIcons) 
                    itemData.img = IconAssign.iconAssign(itemData.system.importFlags, iconList, itemData.system);

                parsedArmors.push(itemData);
            } catch (e) {
                console.error(e);
            }
        };

        return parsedArmors;
    }

    parseArmor(chummerArmor: Unwrap<NonNullable<ActorSchema['armors']>['armor']>) {
        const parserType = 'armor';
        const system = DataDefaults.baseSystemData('armor');
        const armor = system.armor;

        armor.mod = chummerArmor.armor.includes('+');
        armor.value = parseInt(chummerArmor.armor);

        if (chummerArmor.armormods?.armormod) {
            armor.fire = 0;
            armor.electricity = 0;
            armor.cold = 0;
            armor.acid = 0;
            armor.radiation = 0;

            const mods = getArray(chummerArmor.armormods.armormod);
            mods.forEach((mod) => {
                if (mod.name_english.toLowerCase().includes('fire resistance')) {
                    armor.fire += parseInt(mod.rating);
                } else if (mod.name_english.toLowerCase().includes('nonconductivity')) {
                    armor.electricity += parseInt(mod.rating);
                } else if (mod.name_english.toLowerCase().includes('insulation')) {
                    armor.cold += parseInt(mod.rating);
                } else if (mod.name_english.toLowerCase().includes('radiation shielding')) {
                    armor.radiation += parseInt(mod.rating);
                }
            });
        }

        system.technology = parseTechnology(chummerArmor);
        system.description = parseDescription(chummerArmor);

        // Assign import flags
        system.importFlags = genImportFlags(formatAsSlug(chummerArmor.name_english), parserType);
        setSubType(system, parserType, formatAsSlug(chummerArmor.category_english));

        return createItemData(chummerArmor.name, parserType, system);
    }

    parseOtherArmor(chummerArmor: Unwrap<NonNullable<ActorSchema['otherarmors']>['otherarmor']>) {
        const parserType = 'armor';
        const system = DataDefaults.baseSystemData('armor');
        const armor = system.armor;

        armor.mod = chummerArmor.armor.includes('+');
        armor.value = Number(chummerArmor.armor) || 0;
        system.technology.equipped = true;

        // Assign import flags
        system.importFlags = genImportFlags(formatAsSlug(chummerArmor.objectname_english), parserType);
        setSubType(system, parserType, formatAsSlug(chummerArmor.improvesource));

        return createItemData(chummerArmor.objectname_english, parserType, system);
    }
}