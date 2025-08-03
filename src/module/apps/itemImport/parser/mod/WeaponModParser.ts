import { Parser } from '../Parser';
import { Accessory } from '../../schema/WeaponsSchema';
import { CompendiumKey } from '../../importer/Constants';
import { ImportHelper as IH } from '../../helper/ImportHelper';
import { TranslationHelper as TH } from '../../helper/TranslationHelper';
import ModificationItemData = Shadowrun.ModificationItemData;
import MountType = Shadowrun.MountType;

export class WeaponModParser extends Parser<ModificationItemData> {
    protected override parseType: string = 'modification';

    protected override getSystem(jsonData: Accessory): ModificationItemData['system'] {
        const system = this.getBaseSystem();

        system.type = 'weapon';

        system.mount_point = jsonData.mount ? (jsonData.mount._TEXT.toLowerCase() as MountType) : "";

        system.rc = Number(jsonData.rc?._TEXT) || 0;
        system.accuracy = Number(jsonData.accuracy?._TEXT) || 0;

        return system;
    }

    protected override async getFolder(jsonData: Accessory, compendiumKey: CompendiumKey): Promise<Folder> {
        const category = jsonData.mount ? jsonData.mount._TEXT : "Other";
        const rootFolder = "Weapon-Mod";
        let folderName = TH.getTranslation(category, {type: 'accessory'});

        if (folderName.includes("/")) 
            folderName = "Multiple Points";

        return IH.getFolder(compendiumKey, rootFolder, folderName);
    }
}
