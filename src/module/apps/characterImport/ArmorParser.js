import { parseDescription, getArray, parseTechnology, createItemData } from "./BaseParserFunctions.js"

export class ArmorParser {
   
    parseArmors(chummerChar) {
        const armors = getArray(chummerChar.armors.armor);
        const parsedArmors = [];
        armors.forEach((chummerArmor) => {
            try {
                const itemData = this.parseArmor(chummerArmor);
                parsedArmors.push(itemData);
            } catch (e) {
                console.error(e);
            }
        });

        return parsedArmors;
    }

    parseArmor(chummerArmor) {
        const data = {};
        const armor = {};
        data.armor = armor;

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

        data.technology = parseTechnology(chummerArmor);
        data.description = parseDescription(chummerArmor);
        
        return createItemData(chummerArmor.name, 'armor', data);
    }
}