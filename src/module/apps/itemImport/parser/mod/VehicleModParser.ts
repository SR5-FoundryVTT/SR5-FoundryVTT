import { Parser, SystemType } from '../Parser';
import { Mod } from '../../schema/VehiclesSchema';
import { ImportHelper as IH } from '../../helper/ImportHelper';

export class VehicleModParser extends Parser<'modification'> {
    protected parseType = 'modification' as const;

    protected override getSystem(jsonData: Mod) {
        const system = this.getBaseSystem();

        system.type = 'vehicle';

        const categoryName = jsonData.category._TEXT;

        system.modification_category = (
            categoryName === undefined      ? "" :
            categoryName === "Powertrain"   ? "power_train"
                                            : categoryName.toLowerCase()
        ) as SystemType<'modification'>['modification_category'];

        const slots = jsonData.slots._TEXT.match(/[0-9]\.?[0-9]*/g);
        if (slots)
            system.slots = Number(slots[0]);

        return system;
    }

    protected override async getFolder(jsonData: Mod): Promise<Folder> {
        const validCategory = ['Body', 'Cosmetic', 'Electromagnetic', 'Powertrain', 'Protection', 'Weapons'];
        const category = jsonData.category._TEXT;
        const rootFolder = "Vehicle-Mods";
        const folderName = validCategory.includes(category) ? category : "Other";

        return IH.getFolder('Modification', rootFolder, folderName);
    }
}
