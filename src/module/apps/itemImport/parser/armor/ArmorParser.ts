import { Parser } from '../Parser';
import { Armor } from '../../schema/ArmorSchema'
import { ImportHelper as IH } from '../../helper/ImportHelper';
import { TranslationHelper as TH } from '../../helper/TranslationHelper';

export class ArmorParser extends Parser<'armor'> {
    protected parseType = 'armor' as const;

    protected override getSystem(jsonData: Armor): Item.SystemOfType<'armor'> {
        const system = this.getBaseSystem() as Item.SystemOfType<'armor'>;

        system.armor.value = Number(jsonData.armor._TEXT) || 0;
        system.armor.mod = jsonData.armor._TEXT.includes('+');

        return system;
    }

    protected override async getFolder(jsonData: Armor): Promise<Folder> {
        const rootFolder = TH.getTranslation("Armor", { type: 'category' });
        const category = TH.getTranslation(jsonData.category._TEXT, { type: 'category' });

        return IH.getFolder('Gear', rootFolder, category);
    }
}
