import { Parser } from '../Parser';
import { Accessory } from '../../schema/WeaponsSchema';
import { ImportHelper as IH } from '../../helper/ImportHelper';
import { TranslationHelper as TH } from '../../helper/TranslationHelper';

export class WeaponModParser extends Parser<'modification'> {
    protected parseType = 'modification' as const;

    protected override getSystem(jsonData: Accessory) {
        const system = this.getBaseSystem();

        system.type = 'weapon';

        //@ts-expect-error to fix
        system.mount_point = jsonData.mount ? (jsonData.mount._TEXT.toLowerCase()) : "";

        system.rc = Number(jsonData.rc?._TEXT) || 0;
        system.accuracy = Number(jsonData.accuracy?._TEXT) || 0;

        return system;
    }

    protected override async getFolder(jsonData: Accessory): Promise<Folder> {
        const category = jsonData.mount ? jsonData.mount._TEXT : "Other";
        const rootFolder = "Weapon-Mod";
        let folderName = TH.getTranslation(category, {type: 'accessory'});

        if (folderName.includes("/")) 
            folderName = "Multiple Points";

        return IH.getFolder('Modification', rootFolder, folderName);
    }
}
