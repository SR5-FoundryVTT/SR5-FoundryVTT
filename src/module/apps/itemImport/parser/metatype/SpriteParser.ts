import { Metatype } from "../../schema/MetatypeSchema";
import { CompendiumKey } from "../../importer/Constants";
import { MetatypeParserBase } from './MetatypeParserBase';
import { ImportHelper as IH } from '../../helper/ImportHelper';

export class SpriteParser extends MetatypeParserBase<'sprite'> {
    protected readonly parseType = 'sprite';

    protected override getSystem(jsonData: Metatype) {
        const system = this.getBaseSystem();

        system.spriteType = jsonData.name._TEXT.split(" ")[0].toLowerCase();

        return system;
    }

    protected override async getItems(jsonData: Metatype): Promise<Item.Source[]> {
        const optionalpowers = jsonData.bonus?.optionalpowers;
        const powers = [...IH.getArray(jsonData.powers?.power), ...IH.getArray(optionalpowers?.optionalpower)].map(i => i._TEXT);

        const allPowers = await IH.findItems('Critter_Power', powers);
        const name = jsonData.name._TEXT;

        return [
            ...this.getMetatypeItems(allPowers, jsonData.powers?.power, { type: 'Power', critter: name }),
            ...this.getMetatypeItems(allPowers, optionalpowers?.optionalpower, { type: 'Optional Power', critter: name }),
        ];
    }

    protected override async getFolder(jsonData: Metatype, compendiumKey: CompendiumKey): Promise<Folder> {
        const folderName = game.i18n.localize('TYPES.Actor.sprite');

        return  IH.getFolder(compendiumKey, folderName);
    }
}
