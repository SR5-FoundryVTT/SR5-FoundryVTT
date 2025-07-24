import { ItemDataSource } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/itemData';
import { Parser } from '../Parser';
import { SR5Item } from '../../../../item/SR5Item';
import { ImportHelper as IH, OneOrMany } from '../../helper/ImportHelper';
import ShadowrunActorData = Shadowrun.ShadowrunActorData;

export abstract class MetatypeParserBase<TResult extends ShadowrunActorData> extends Parser<TResult> {
    getMetatypeItems(
        items: SR5Item[],
        itemData: undefined | OneOrMany<{$?: { select?: string; rating?: string; removable?: string; }; _TEXT: string }>,
        msg_field: {type: string; critter: string},
        translatedTraitNames: Record<string, string>
    ): ItemDataSource[] {
        const itemMap = new Map(items.map(i => [i.name, i]));

        const result: ItemDataSource[] = [];

        for (const item of IH.getArray(itemData)) {
            const name = item._TEXT;
            const translatedName = translatedTraitNames[name] || name;
            const foundItem = itemMap.get(translatedName);

            if (!foundItem) {
                console.log(`[${msg_field.type} Missing]\nCritter: ${msg_field.critter}\n${msg_field.type}: ${name}`);
                continue;
            }

            const itemBase = game.items!.fromCompendium(foundItem, { keepId: true }) as ItemDataSource;

            if (item.$?.select)
                itemBase.name += ` (${item.$.select})`;
    
            if (msg_field.type === 'Optional Power' && 'optional' in itemBase.system)
                itemBase.system.optional = 'disabled_option';

            if (item.$?.rating) {
                const rating = +item.$.rating;
                if ('rating' in itemBase.system)
                    itemBase.system.rating = rating;
                else if ('technology' in itemBase.system)
                    itemBase.system.technology.rating = rating;
            }

            result.push(itemBase);
        }

        return result;
    }    
}
