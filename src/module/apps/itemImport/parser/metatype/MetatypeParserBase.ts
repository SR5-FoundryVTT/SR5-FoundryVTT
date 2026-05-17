import { Parser } from '../Parser';
import { ImportHelper as IH, OneOrMany, RetrievedItem } from '../../helper/ImportHelper';

export abstract class MetatypeParserBase<TResult extends ('character' | 'spirit' | 'sprite')> extends Parser<TResult> {
    getMetatypeItems(
        items: RetrievedItem[],
        itemsData: undefined | OneOrMany<{$?: { select?: string; rating?: string; removable?: string; spec?: string }; _TEXT: string }>,
        msg_field: {type: string; critter: string},
    ): Item.Source[] {
        const itemMap = new Map(items.map(({name_english, ...i}) => [name_english, i]));

        const result: Item.Source[] = [];
        for (const itemData of IH.getArray(itemsData)) {
            const name = itemData._TEXT;
            const item = itemMap.get(name);

            if (!item) {
                console.warn(`[${msg_field.type} Missing]\nCritter: ${msg_field.critter}\n${msg_field.type}: ${name}`);
                continue;
            }

            item._id = foundry.utils.randomID();
            const system = item.system;

            if (itemData.$?.select)
                item.name += ` (${itemData.$.select})`;

            if (msg_field.type === 'Optional Power' && 'optional' in system && system.optional)
                system.optional = 'disabled_option';

            if (itemData.$?.rating) {
                const rating = Number(itemData.$.rating) || 0;
                if ('rating' in system)
                    system.rating = rating;
                else if ('technology' in system)
                    system.technology.rating = rating;
                else if ('skill' in system) {
                    system.group.rating = itemData.$.rating.includes('F') ? 1 : rating;
                    system.skill.rating = itemData.$.rating.includes('F') ? 1 : rating;
                    if (itemData.$.spec) system.skill.specializations.push({ name: itemData.$.spec });
                }
            }

            result.push(item);
        }

        return result;
    }    
}
