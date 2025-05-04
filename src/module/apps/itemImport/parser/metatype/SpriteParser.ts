import { ImportHelper as IH, NotEmpty } from '../../helper/ImportHelper';
import { MetatypeParserBase } from './MetatypeParserBase';
import {_mergeWithMissingSkillFields} from "../../../../actor/prep/functions/SkillsPrep";
import { Metatype } from "../../schema/MetatypeSchema";
import SpriteActorData = Shadowrun.SpriteActorData;

export class SpriteParser extends MetatypeParserBase<SpriteActorData> {
    override async Parse(jsonData: Metatype, sprite: SpriteActorData, jsonTranslation?: object): Promise<SpriteActorData> {
        const optionalpowers = jsonData.bonus?.optionalpowers;
        const allPowersName = [
            ...IH.getArray(jsonData.powers?.power).map(item => IH.MapNameToTranslation(jsonTranslation, item._TEXT)),
            ...IH.getArray(optionalpowers?.optionalpower).map(item => IH.MapNameToTranslation(jsonTranslation, item._TEXT)),
        ];

        const powerPromise = IH.findItem('Trait', allPowersName);

        sprite.name = jsonData.name._TEXT;
        sprite.system.description.source = `${jsonData.source._TEXT} ${jsonData.page._TEXT}`;

        sprite.system.spriteType = jsonData.name._TEXT.split(" ")[0].toLowerCase();

        const allPowers = await powerPromise;

        //@ts-expect-error
        sprite.items = [
            ...this.getItems(allPowers, jsonData.powers?.power, {type: 'Power', critter: sprite.name}, jsonTranslation),
            ...this.getItems(allPowers, optionalpowers?.optionalpower, {type: 'Optional Power', critter: sprite.name}, jsonTranslation),
        ];

        if (jsonTranslation) {
            const page = IH.MapNameToPageSource(jsonTranslation, sprite.name);
            sprite.system.description.source = `${jsonData.source._TEXT} ${page}`;
            sprite.name = IH.MapNameToTranslation(jsonTranslation, sprite.name);
        }

        return sprite;
    }
}
