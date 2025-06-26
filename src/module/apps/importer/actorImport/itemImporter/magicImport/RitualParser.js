import { parseDescription, getArray, createItemData, formatAsSlug, genImportFlags, setSubType } from "../importHelper/BaseParserFunctions.js"
import * as IconAssign from '../../../../iconAssigner/iconAssign.js';

export class RitualParser {
    async parseRituals(chummerChar, assignIcons) {
        const items = getArray(chummerChar.spells.spell).filter(chummerSpell => chummerSpell.category_english.includes("Rituals"));
        const parsedItems = [];
        const iconList = await IconAssign.getIconFiles();

        items.forEach(async (item) => {
            try {
                if (item.alchemy.toLowerCase() !== 'true') {
                    const itemData = this.parseRitual(item);

                    // Assign the icon if enabled
                    if (assignIcons) {itemData.img = await IconAssign.iconAssign(itemData.system.importFlags, iconList, itemData.system)};

                    parsedItems.push(itemData);
                }
            } catch (e) {
                console.error(e);
            }
        });

        return parsedItems;
    }

    parseRitual(chummerRitual) {
        const parserType = 'ritual';
        const system = {};

        this.prepareSystem(system, chummerRitual)
        this.prepareAction(system)

        // Assign import flags
        system.importFlags = genImportFlags(formatAsSlug(chummerRitual.name_english), parserType);
        setSubType(system, parserType, formatAsSlug(chummerRitual.category_english));

        return createItemData(chummerRitual.name, parserType, system);
    }

    prepareSystem(system, chummerRitual) {
        system.name = chummerRitual.name;
        system.type = chummerRitual.type === 'M' ? 'mana' : 'physical';
        system.descriptors = chummerRitual.descriptors;
        system.description = parseDescription(chummerRitual);
    }


    prepareAction(system) {
        system.action = {};
        system.action.type = 'varies';
        system.action.skill = 'ritual_spellcasting';
        system.action.attribute = 'magic';
    }
}