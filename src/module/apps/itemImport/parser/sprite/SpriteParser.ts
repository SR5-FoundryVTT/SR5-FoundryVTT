import { ImportHelper as IH, NotEmpty } from '../../helper/ImportHelper';
import { ActorParserBase } from '../item/ActorParserBase';
// import { getArray } from '../../../importer/actorImport/itemImporter/importHelper/BaseParserFunctions.js';
import { DataDefaults } from '../../../../data/DataDefaults';
import {_mergeWithMissingSkillFields} from "../../../../actor/prep/functions/SkillsPrep";
import SpriteActorData = Shadowrun.SpriteActorData;
import { SR5 } from '../../../../config';
import { Metatype } from "../../schema/MetatypeSchema";
import { json } from 'stream/consumers';
import { ItemDataSource } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/itemData';

export class SpriteParser extends ActorParserBase<SpriteActorData> {
    private getItems(
        array: undefined | NotEmpty<Metatype['powers']>['power'],
        searchType: Parameters<typeof IH.findItem>[1],
        msg_field: {type: string; critter: string},
        jsonTranslation?: object
    ): ItemDataSource[] {
        const result: ItemDataSource[] = []

        for(const item of IH.getArray(array)) {
            let name = item._TEXT;

            if (name === 'Deezz') name = 'Derezz';
            else if (name === 'Shiva Arms') name += ' (Pair)';
            else if (name === 'Regenerate') name = 'Regeneration';

            const translatedName = IH.MapNameToTranslation(jsonTranslation, name);
            const foundItem = IH.findItem(translatedName, searchType);

            if (!foundItem) {
                console.log(
                    `[${msg_field.type} Missing]\nCritter: ${msg_field.critter}\n${msg_field.type}: ${name}`
                );
                continue;
            }

            let itemBase = foundItem.toObject();

            if (msg_field.type === 'Optional Power' && 'optional' in itemBase.system)
                itemBase.system.optional = 'disabled_option';

            result.push(itemBase);
        }
        
        return result;
    }

    override Parse(
        jsonData: Metatype,
        sprite: SpriteActorData,
        jsonTranslation?: object | undefined,
    ): SpriteActorData {
        sprite.name = jsonData.name._TEXT;
        sprite.system.description.source = `${jsonData.source._TEXT} ${jsonData.page._TEXT}`;

        sprite.system.spriteType = jsonData.name._TEXT.split(" ")[0].toLowerCase();

        //@ts-expect-error
        sprite.items = [
            ...this.getItems(jsonData.powers?.power, ['critter_power', 'sprite_power'], {type: 'Power', critter: sprite.name}, jsonTranslation),
        ];

        if (jsonData.bonus?.optionalpowers?.optionalpower) {
            const optionalPowers = jsonData.bonus.optionalpowers.optionalpower;
            //@ts-expect-error
            sprite.items = sprite.items.concat([
                ...this.getItems(optionalPowers, ['critter_power', 'sprite_power'], {type: 'Optional Power', critter: sprite.name}, jsonTranslation),
            ]);
        }

        if (jsonTranslation) {
            const page = IH.MapNameToPageSource(jsonTranslation, sprite.name);
            sprite.system.description.source = `${jsonData.source._TEXT} ${page}`;
            sprite.name = IH.MapNameToTranslation(jsonTranslation, sprite.name);
        }

        return sprite;
    }
}
