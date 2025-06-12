import { Metatype } from "../../schema/MetatypeSchema";
import { MetatypeParserBase } from './MetatypeParserBase';
import { ImportHelper as IH } from '../../helper/ImportHelper';
import { TranslationHelper as TH } from '../../helper/TranslationHelper';

export class SpriteParser extends MetatypeParserBase<'sprite'> {
    protected parseType = 'sprite' as const;

    protected override getSystem(jsonData: Metatype) {
        const system = this.getBaseSystem();

        system.spriteType = jsonData.name._TEXT.split(" ")[0].toLowerCase();

        return system;
    }

    protected override async getItems(jsonData: Metatype): Promise<Item.Source[]> {
        const optionalpowers = jsonData.bonus?.optionalpowers;
        const allPowers = [...IH.getArray(jsonData.powers?.power), ...IH.getArray(optionalpowers?.optionalpower)].map(i => i._TEXT);
        const translationMap: Record<string, string> = {};

        allPowers.forEach(p => translationMap[p] = TH.getTranslation(p, { type: 'power' }));

        const traits = await IH.findItem('Trait', allPowers.map(p => translationMap[p]));
        const name = jsonData.name._TEXT;

        return [
            ...this.getMetatypeItems(traits, jsonData.powers?.power, { type: 'Power', critter: name }, translationMap),
            ...this.getMetatypeItems(traits, optionalpowers?.optionalpower, { type: 'Optional Power', critter: name }, translationMap),
        ];
    }

    protected override async getFolder(jsonData: Metatype): Promise<Folder> {
        const folderName = TH.getTranslation('Sprite', {type: 'category'});

        return  IH.getFolder('Critter', folderName);
    }
}
