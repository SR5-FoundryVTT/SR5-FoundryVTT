import { Parser, SystemType } from '../Parser';
import { Accessory } from '../../schema/WeaponsSchema';
import { ImportHelper as IH } from '../../helper/ImportHelper';
import { TranslationHelper as TH } from '../../helper/TranslationHelper';

export class WeaponModParser extends Parser<'modification'> {
    protected readonly parseType = 'modification';

    protected override getSystem(jsonData: Accessory) {
        const system = this.getBaseSystem();
        
        if (jsonData.mount) {
            const mount = jsonData.mount._TEXT.toLowerCase().split('/')[0] || '';
            system.mount_point = mount as SystemType<'modification'>['mount_point'];
        }
        
        system.type = 'weapon';
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
