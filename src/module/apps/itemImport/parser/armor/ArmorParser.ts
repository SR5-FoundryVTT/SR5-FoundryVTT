import { Parser } from '../Parser';
import { Armor } from '../../schema/ArmorSchema'
import { ImportHelper as IH } from '../../helper/ImportHelper';
import { TranslationHelper as TH } from '../../helper/TranslationHelper';

export class ArmorParser extends Parser<'armor'> {
    protected readonly parseType = 'armor';

    protected override getSystem(jsonData: Armor) {
        const system = this.getBaseSystem();

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
