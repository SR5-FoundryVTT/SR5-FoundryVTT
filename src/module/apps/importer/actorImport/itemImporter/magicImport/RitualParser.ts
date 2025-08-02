import { parseDescription, getArray, createItemData, formatAsSlug, genImportFlags, setSubType } from "../importHelper/BaseParserFunctions"
import * as IconAssign from '../../../../iconAssigner/iconAssign';
import { ActorSchema } from "../../ActorSchema";
import { Unwrap } from "../ItemsParser";


export class RitualParser {
    async parseRituals(chummerChar: ActorSchema, assignIcons: boolean) {
        const items = getArray(chummerChar.spells?.spell).filter(chummerSpell => chummerSpell.category_english.includes("Rituals"));
        const parsedItems: any[] = [];
        const iconList = await IconAssign.getIconFiles();

        for (const item of items) {
            try {
                if (item.alchemy.toLowerCase() !== 'true') {
                    const itemData = this.parseRitual(item);

                    // Assign the icon if enabled
                    if (assignIcons)
                        itemData.img = IconAssign.iconAssign(itemData.system.importFlags, iconList, itemData.system);

                    parsedItems.push(itemData);
                }
            } catch (e) {
                console.error(e);
            }
        };

        return parsedItems;
    }

    parseRitual(chummerRitual: Unwrap<NonNullable<ActorSchema['spells']>['spell']>) {
        const parserType = 'ritual';
        const system = {} as any;

        this.prepareSystem(system, chummerRitual)
        this.prepareAction(system)

        // Assign import flags
        system.importFlags = genImportFlags(formatAsSlug(chummerRitual.name_english), parserType);
        setSubType(system, parserType, formatAsSlug(chummerRitual.category_english));

        return createItemData(chummerRitual.name, parserType as any, system);
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
