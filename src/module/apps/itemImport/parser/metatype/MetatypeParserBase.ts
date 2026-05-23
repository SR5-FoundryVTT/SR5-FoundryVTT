import { Parser } from '../Parser';
import { Metatype } from '../../schema/MetatypeSchema';
import { ImportHelper as IH, OneOrMany, RetrievedItem } from '../../helper/ImportHelper';

type MetatypeItemData = {
    _TEXT: string;
    $?: { select?: string; rating?: string; spec?: string };
};

export abstract class MetatypeParserBase<TResult extends ('character' | 'spirit' | 'sprite')> extends Parser<TResult> {
    /**
     * Merges many optional one-or-many arrays into a single non-null list.
     */
    protected mergeLists<T>(...lists: Array<OneOrMany<T | undefined>>): Array<NonNullable<T>> {
        return lists.flatMap(list => IH.getArray(list)).filter((v): v is NonNullable<T> => v != null);
    }

    /**
     * Converts one-or-many `_TEXT` collections into a flat name list.
     */
    protected getNamedList(...collections: Array<undefined | OneOrMany<{ _TEXT: string }>>) {
        return collections.flatMap(collection => IH.getArray(collection).map(entry => entry._TEXT));
    }

    /**
     * Applies movement values from metatype walk/run/sprint fields to actor movement base values.
     */
    protected applyMovement(
        system: ReturnType<typeof this.getBaseSystem>,
        jsonData: Pick<Metatype, 'walk' | 'run' | 'sprint'>,
    ) {
        if (!('movement' in system)) return;

        if (jsonData.walk)
            system.movement.walk.base = Number(jsonData.walk._TEXT.split('/')[0] ?? 0);

        if (jsonData.run)
            system.movement.run.base = Number(jsonData.run._TEXT.split('/')[0] ?? 0);

        system.movement.sprint = Number(jsonData.sprint?._TEXT.split('/')[0] ?? 0);
    }

    getMetatypeItems(
        items: RetrievedItem[],
        itemsData: OneOrMany<MetatypeItemData> | undefined,
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
                //todo this could be 'F'
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
