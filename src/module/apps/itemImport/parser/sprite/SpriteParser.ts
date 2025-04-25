import { ImportHelper as IH, TypeAtPath, TypeAtPaths } from '../../helper/ImportHelper';
import { ActorParserBase } from '../item/ActorParserBase';
// import { getArray } from '../../../importer/actorImport/itemImporter/importHelper/BaseParserFunctions.js';
import { DataDefaults } from '../../../../data/DataDefaults';
import {_mergeWithMissingSkillFields} from "../../../../actor/prep/functions/SkillsPrep";
import SpriteActorData = Shadowrun.SpriteActorData;
import { SR5 } from '../../../../config';
import { Metatype } from "../../schema/MetatypeSchema";
import { json } from 'stream/consumers';

export class SpriteParser extends ActorParserBase<SpriteActorData> {
    private getPowers(
        array: TypeAtPath<Metatype, "powers.power">,
        spriteName: string,
        jsonTranslation?: object
    ): object[] {
        if (!array) return [];

        return IH.getArray(array)
            .map((item) => {
                let name = item._TEXT;

                const translatedName = IH.MapNameToTranslation(jsonTranslation, name);
                const foundItem = IH.findItem((item) => {
                    return !!item?.name && item.type === 'sprite_power' && item.name === translatedName;
                });

                if (!foundItem) {
                    console.log(
                        `[Power Missing]\nCritter: ${spriteName}\nPower: ${name}`
                    );
                    return null;
                }

                return foundItem.toObject();
            })
            .filter((item): item is NonNullable<typeof item> => !!item);
    }

    override Parse(
        jsonData: Metatype,
        sprite: SpriteActorData,
        jsonTranslation?: object | undefined,
    ): SpriteActorData {
        sprite.name = jsonData.name._TEXT;
        sprite.system.description.source = `${jsonData.source._TEXT} ${jsonData.page._TEXT}`;

        sprite.system.spriteType = jsonData.name._TEXT.split(" ")[0].toLowerCase();

        //TODO optionalpowers
        //@ts-expect-error
        sprite.items = [
            ...this.getPowers(jsonData.powers?.power, sprite.name, jsonTranslation),
        ];

        if (jsonTranslation) {
            const page = IH.MapNameToPageSource(jsonTranslation, sprite.name);
            sprite.system.description.source = `${jsonData.source._TEXT} ${page}`;
            sprite.name = IH.MapNameToTranslation(jsonTranslation, sprite.name);
        }

        return sprite;
    }
}
