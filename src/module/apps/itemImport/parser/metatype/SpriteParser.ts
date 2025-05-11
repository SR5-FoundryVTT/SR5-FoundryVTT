import { Metatype } from "../../schema/MetatypeSchema";
import { MetatypeParserBase } from './MetatypeParserBase';
import { ImportHelper as IH } from '../../helper/ImportHelper';
import { TranslationHelper as TH } from '../../helper/TranslationHelper';
import SpriteActorData = Shadowrun.SpriteActorData;

export class SpriteParser extends MetatypeParserBase<SpriteActorData> {
    protected override parseType: string = 'sprite';

    protected override getSystem(jsonData: Metatype): SpriteActorData['system'] {
        const system = this.getBaseSystem();

        system.spriteType = jsonData.name._TEXT.split(" ")[0].toLowerCase();

        return system;
    }

    protected override async getItems(jsonData: Metatype): Promise<Shadowrun.ShadowrunItemData[]> {
        const optionalpowers = jsonData.bonus?.optionalpowers;
        const allPowersName = [
            ...IH.getArray(jsonData.powers?.power), ...IH.getArray(optionalpowers?.optionalpower),
        ].map(item => item._TEXT);

        const allPowers = await IH.findItem('Trait', allPowersName);

        const spriteName = jsonData.name._TEXT;
        return [
            ...this.getMetatypeItems(allPowers, jsonData.powers?.power, {type: 'Power', critter: spriteName}),
            ...this.getMetatypeItems(allPowers, optionalpowers?.optionalpower, {type: 'Optional Power', critter: spriteName}),
        ];
    }

    protected override async getFolder(jsonData: Metatype): Promise<Folder> {
        const folderName = TH.getTranslation('Sprite', {type: 'category'});

        return  IH.getFolder('Critter', folderName);
    }
}
