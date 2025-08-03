import { Metatype } from "../../schema/MetatypeSchema";
import { MetatypeParserBase } from './MetatypeParserBase';
import { ImportHelper as IH } from '../../helper/ImportHelper';
import { TranslationHelper as TH } from '../../helper/TranslationHelper';
import SpriteActorData = Shadowrun.SpriteActorData;
import { CompendiumKey } from "../../importer/Constants";

export class SpriteParser extends MetatypeParserBase<SpriteActorData> {
    protected override parseType: string = 'sprite';

    protected override getSystem(jsonData: Metatype): SpriteActorData['system'] {
        const system = this.getBaseSystem();

        system.spriteType = jsonData.name._TEXT.split(" ")[0].toLowerCase();

        return system;
    }

    protected override async getItems(jsonData: Metatype): Promise<Shadowrun.ShadowrunItemData[]> {
        const optionalpowers = jsonData.bonus?.optionalpowers;
        const powers = [...IH.getArray(jsonData.powers?.power), ...IH.getArray(optionalpowers?.optionalpower)].map(i => i._TEXT);
        const translationMap: Record<string, string> = {};

        powers.forEach(p => translationMap[p] = TH.getTranslation(p, { type: 'power' }));

        const allPowers = await IH.findItem('Critter_Power', powers.map(p => translationMap[p]));
        const name = jsonData.name._TEXT;

        return [
            ...this.getMetatypeItems(allPowers, jsonData.powers?.power, { type: 'Power', critter: name }, translationMap),
            ...this.getMetatypeItems(allPowers, optionalpowers?.optionalpower, { type: 'Optional Power', critter: name }, translationMap),
        ];
    }

    protected override async getFolder(jsonData: Metatype, compendiumKey: CompendiumKey): Promise<Folder> {
        const folderName = TH.getTranslation('Sprite', {type: 'category'});

        return await IH.getFolder(compendiumKey, folderName);
    }
}
