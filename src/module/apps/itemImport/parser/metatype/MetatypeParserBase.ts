import { Parser, SystemType } from '../Parser';
import { SR5Item } from '../../../../item/SR5Item';
import { ImportHelper as IH, OneOrMany } from '../../helper/ImportHelper';

export abstract class MetatypeParserBase<TResult extends ('character' | 'critter' | 'spirit' | 'sprite')> extends Parser<TResult> {
    getMetatypeItems(
        items: SR5Item[],
        itemData: undefined | OneOrMany<{$?: { select?: string; rating?: string; removable?: string; }; _TEXT: string }>,
        msg_field: {type: string; critter: string},
        translatedTraitNames: Record<string, string>
    ): Item.Source[] {
        const itemMap = new Map(items.map(i => [i.name, i]));

        const result: Item.Source[] = [];

        for (const item of IH.getArray(itemData)) {
            const name = item._TEXT;
            const translatedName = translatedTraitNames[name] || name;
            const foundItem = itemMap.get(translatedName);

            if (!foundItem) {
                console.log(`[${msg_field.type} Missing]\nCritter: ${msg_field.critter}\n${msg_field.type}: ${name}`);
                continue;
            }

            const itemBase = foundItem.toObject();
            const system = itemBase.system as SystemType<'bioware' | 'cyberware' | 'complex_form' | 'quality' | 'spell' | 'adept_power' | 'critter_power' | 'weapon' | 'equipment'>;

            if (item.$?.select)
                itemBase.name += ` (${item.$.select})`;
    
            if (msg_field.type === 'Optional Power' && 'optional' in system && system.optional)
                system.optional = 'disabled_option';

            if (item.$?.rating) {
                //todo this could be 'F'
                const rating = Number(item.$.rating) || 0;
                if ('rating' in system)
                    system.rating = rating;
                else if ('technology' in system && system.technology)
                    system.technology.rating = rating;
            }

            result.push(itemBase as Item.Source);
        }

        return result;
    }    
}
