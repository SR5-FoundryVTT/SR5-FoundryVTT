import { Parser } from '../Parser';
import { ImportHelper as IH, OneOrMany } from '../../helper/ImportHelper';
import { SR5 } from '../../../../config';
import { DataDefaults } from '../../../../data/DataDefaults';
import { ItemDataSource } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/itemData';
import ShadowrunActorData = Shadowrun.ShadowrunActorData;

export abstract class MetatypeParserBase<TResult extends ShadowrunActorData> extends Parser<TResult> {
    abstract override Parse(jsonData: object, item: TResult, jsonTranslation?: object): TResult;

    getItems(
        array: undefined | OneOrMany<{$?: { select?: string; rating?: string; removable?: string; }; _TEXT: string }>,
        searchType: Parameters<typeof IH.findItem>[1],
        msg_field: {type: string; critter: string},
        jsonTranslation?: object
    ): ItemDataSource[] {
        const result: ItemDataSource[] = []

        for(const item of IH.getArray(array)) {
            let name = item._TEXT;

            if (name === 'Innate Spell' && item.$?.select) {
                let spellName = item.$.select;
                const translatedName = IH.MapNameToTranslation(jsonTranslation, spellName);
                const foundSpell = IH.findItem(translatedName, 'spell');

                if (foundSpell)
                    result.push(foundSpell.toObject());
                else
                    console.log(`[Spell Missing]\nCritter: ${msg_field.critter}\nSpell: ${spellName}`);
            }

            const translatedName = IH.MapNameToTranslation(jsonTranslation, name);
            const foundItem = IH.findItem(translatedName, searchType);

            if (!foundItem) {
                console.log(
                    `[${msg_field.type} Missing]\nCritter: ${msg_field.critter}\n${msg_field.type}: ${name}`
                );
                continue;
            }

            let itemBase = foundItem.toObject();

            if (item.$ && "rating" in item.$ && item.$.rating) {
                const rating = +item.$.rating;

                if ('rating' in itemBase.system) {
                    itemBase.system.rating = rating;
                } else if ('technology' in itemBase.system) {
                    itemBase.system.technology.rating = rating;
                }
            }

            if (item.$ && "select" in item.$ && item.$.select)
                itemBase.name += ` (${item.$.select})`

            if (msg_field.type === 'Optional Power' && 'optional' in itemBase.system)
                itemBase.system.optional = 'disabled_option';

            result.push(itemBase);
        }
        
        return result;
    }
}
