import { Parser } from '../Parser';
import { Mod } from '../../schema/VehiclesSchema';
import { ImportHelper as IH } from '../../helper/ImportHelper';
import ModificationItemData = Shadowrun.ModificationItemData;
import ModificationCategoryType = Shadowrun.ModificationCategoryType;

export class VehicleModParser extends Parser<ModificationItemData> {
    protected override parseType: string = 'modification';

    protected override getSystem(jsonData: Mod): ModificationItemData['system'] {
        const system = this.getBaseSystem('Item');
        
        system.type = 'vehicle';
        
        const categoryName = jsonData.category._TEXT;
        
        system.modification_category = (
            categoryName === undefined      ? "" :
            categoryName === "Powertrain"   ? "power_train"
                                            : categoryName.toLowerCase()
        ) as ModificationCategoryType;
        
        system.slots = Number(jsonData.slots) || 0;

        return system;
    }

    protected override async getFolder(jsonData: Mod): Promise<Folder> {
        const validCategory = ['Body', 'Cosmetic', 'Electromagnetic', 'Powertrain', 'Protection', 'Weapons'];
        const category = jsonData.category._TEXT;
        const rootFolder = "Vehicle-Mods";
        const folderName = validCategory.includes(category) ? category : "Other";

        return IH.getFolder('Item', rootFolder, folderName);
    }
}
