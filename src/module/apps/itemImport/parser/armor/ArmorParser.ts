import { Parser } from '../Parser';
import { Armor } from '../../schema/ArmorSchema'
import { CompendiumKey } from '../../importer/Constants';
import { ImportHelper as IH } from '../../helper/ImportHelper';

export class ArmorParser extends Parser<'armor'> {
    protected readonly parseType = 'armor';

    protected override getSystem(jsonData: Armor) {
        const system = this.getBaseSystem();

        system.armor.value = Number(jsonData.armor._TEXT) || 0;
        system.armor.mod = jsonData.armor._TEXT.includes('+');

        return system;
    }

    protected override async getFolder(jsonData: Armor, compendiumKey: CompendiumKey): Promise<Folder> {
        const rootFolder = game.i18n.localize('SR5.ItemTypes.Armor');
        const category = IH.getTranslatedCategory("gear", jsonData.category._TEXT);

        return IH.getFolder(compendiumKey, rootFolder, category);
    }
}
