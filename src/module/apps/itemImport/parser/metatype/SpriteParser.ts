import { ImportHelper as IH, NotEmpty } from '../../helper/ImportHelper';
import { MetatypeParserBase } from './MetatypeParserBase';
import {_mergeWithMissingSkillFields} from "../../../../actor/prep/functions/SkillsPrep";
import { Metatype } from "../../schema/MetatypeSchema";
import SpriteActorData = Shadowrun.SpriteActorData;

export class SpriteParser extends MetatypeParserBase<SpriteActorData> {
    override Parse(jsonData: Metatype, sprite: SpriteActorData, jsonTranslation?: object): SpriteActorData {
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
