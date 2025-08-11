import { Parser, SystemType } from '../Parser';
import { Accessory } from '../../schema/WeaponsSchema';
import { CompendiumKey } from '../../importer/Constants';
import { ImportHelper as IH } from '../../helper/ImportHelper';

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

    protected override async getFolder(jsonData: Accessory, compendiumKey: CompendiumKey): Promise<Folder> {
        const category = jsonData.mount ? jsonData.mount._TEXT : "Other";
        const rootFolder = "Weapon-Mod";
        let folderName = IH.getTranslatedCategory('weapons', category);

        if (folderName.includes("/")) 
            folderName = "Multiple Points";

        return IH.getFolder(compendiumKey, rootFolder, folderName);
    }
}
