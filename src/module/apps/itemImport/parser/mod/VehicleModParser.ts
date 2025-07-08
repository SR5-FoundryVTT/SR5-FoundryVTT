import { Parser } from '../Parser';
import { Mod } from '../../schema/VehiclesSchema';
import { CompendiumKey } from '../../importer/Constants';
import { ImportHelper as IH } from '../../helper/ImportHelper';
import ModificationItemData = Shadowrun.ModificationItemData;
import ModificationCategoryType = Shadowrun.ModificationCategoryType;

export class VehicleModParser extends Parser<ModificationItemData> {
    protected override parseType: string = 'modification';

    protected override getSystem(jsonData: Mod): ModificationItemData['system'] {
        const system = this.getBaseSystem();
        
        system.type = 'vehicle';
        
        const categoryName = jsonData.category._TEXT;
        
        system.modification_category = (
            categoryName === undefined      ? "" :
            categoryName === "Powertrain"   ? "power_train"
                                            : categoryName.toLowerCase()
        ) as ModificationCategoryType;

        const slots = jsonData.slots._TEXT.match(/[0-9]\.?[0-9]*/g);
        if (slots)
            system.slots = Number(slots[0]);

        return system;
    }

    protected override async getFolder(jsonData: Mod, compendiumKey: CompendiumKey): Promise<Folder> {
        const validCategory = ['Body', 'Cosmetic', 'Electromagnetic', 'Powertrain', 'Protection', 'Weapons'];
        const category = jsonData.category._TEXT;
        const rootFolder = "Vehicle-Mods";
        const folderName = validCategory.includes(category) ? category : "Other";

        return IH.getFolder(compendiumKey, rootFolder, folderName);
    }
}
