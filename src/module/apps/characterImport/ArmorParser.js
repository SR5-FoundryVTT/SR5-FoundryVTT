import { parseDescription, getArray, parseTechnology, createItemData, formatAsSlug, genImportFlags, setSubType } from "./BaseParserFunctions.js"
import * as IconAssign from '../../apps/iconAssigner/iconAssign';

export class ArmorParser {

    async parseArmors(chummerChar, assignIcons) {
        const armors = getArray(chummerChar.armors.armor);
        const parsedArmors = [];
        const iconList = await IconAssign.getIconFiles();

        await armors.forEach(async (chummerArmor) => {
            try {
                const itemData = this.parseArmor(chummerArmor);

                // Assign the icon if enabled
                if (assignIcons) {itemData.img = await IconAssign.iconAssign(itemData.system.importFlags, itemData.system, iconList)};

                parsedArmors.push(itemData);
            } catch (e) {
                console.error(e);
            }
        });

        return parsedArmors;
    }

    parseArmor(chummerArmor) {
        const parserType = 'armor';
        const system = {};
        const armor = {};
        system.armor = armor;

        let desc = '';
        armor.mod = chummerArmor.armor.includes('+');
        armor.value = parseInt(chummerArmor.armor.replace('+', ''));
        if (chummerArmor.description)
            desc = chummerArmor.description;

        console.log(chummerArmor);
        if (chummerArmor.armormods && chummerArmor.armormods.armormod) {
            armor.fire = 0;
            armor.electricity = 0;
            armor.cold = 0;
            armor.acid = 0;
            armor.radiation = 0;

            const modDesc = [];
            const mods = getArray(chummerArmor.armormods.armormod);
            mods.forEach((mod) => {
                if (mod.name.toLowerCase().includes('fire resistance')) {
                    armor.fire += parseInt(mod.rating);
                } else if (mod.name.toLowerCase().includes('nonconductivity')) {
                    armor.electricity += parseInt(mod.rating);
                } else if (mod.name.toLowerCase().includes('insulation')) {
                    armor.cold += parseInt(mod.rating);
                } else if (mod.name.toLowerCase().includes('radiation shielding')) {
                    armor.radiation += parseInt(mod.rating);
                }
                if (mod.rating !== '') {
                    modDesc.push(`${mod.name} R${mod.rating}`);
                } else {
                    modDesc.push(mod.name);
                }
            });
            if (modDesc.length > 0) {
                // add desc to beginning
                desc = `${modDesc.join(',')}\n\n${desc}`;
            }
        }

        system.technology = parseTechnology(chummerArmor);
        system.description = parseDescription(chummerArmor);

        // Assign import flags
        system.importFlags = genImportFlags(formatAsSlug(chummerArmor.name_english), parserType);
        setSubType(system, parserType, formatAsSlug(chummerArmor.category_english));

        return createItemData(chummerArmor.name, parserType, system);
    }
}