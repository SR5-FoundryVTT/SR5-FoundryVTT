import { Parser } from '../Parser';
import { Mod } from '../../schema/VehiclesSchema';
import { CompendiumKey } from '../../importer/Constants';
import { ImportHelper as IH } from '../../helper/ImportHelper';

export class VehicleModParser extends Parser<'modification'> {
    protected readonly parseType = 'modification';

    protected override getSystem(jsonData: Mod) {
        const system = this.getBaseSystem();
        system.type = 'vehicle';

        system.modification_category = jsonData.category._TEXT?.toLowerCase() as any;

        const slots = jsonData.slots._TEXT.match(/[0-9]\.?[0-9]*/g);
        if (slots)
            system.slots = Number(slots[0]);

        return system;
    }

    protected override async getFolder(jsonData: Mod, compendiumKey: CompendiumKey): Promise<Folder> {
        const category = jsonData.category._TEXT;
        const rootFolder = "Vehicle-Mods";
        const folderName = IH.getTranslatedCategory('vehicles', category);

        return IH.getFolder(compendiumKey, rootFolder, folderName);
    }
}
