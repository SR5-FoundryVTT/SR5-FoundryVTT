import { Parser } from '../Parser';
import { Armor } from '../../schema/ArmorSchema'
import { ImportHelper as IH } from '../../helper/ImportHelper';
import { TranslationHelper as TH } from '../../helper/TranslationHelper';
import ArmorItemData = Shadowrun.ArmorItemData;
import ArmorData = Shadowrun.ArmorData;
import { CompendiumKey } from '../../importer/Constants';

export class ArmorParser extends Parser<ArmorItemData> {
    protected override parseType: string = 'armor';

    protected override getSystem(jsonData: Armor): ArmorData {
        const system = this.getBaseSystem();

        system.armor.value = Number(jsonData.armor._TEXT) || 0;
        system.armor.mod = jsonData.armor._TEXT.includes('+');

        return system;
    }

    protected override async getFolder(jsonData: Armor, compendiumKey: CompendiumKey): Promise<Folder> {
        const rootFolder = TH.getTranslation("Armor", { type: 'category' });
        const category = TH.getTranslation(jsonData.category._TEXT, { type: 'category' });

        return IH.getFolder(compendiumKey, rootFolder, category);
    }
}
