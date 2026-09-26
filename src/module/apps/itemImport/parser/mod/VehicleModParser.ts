import { Parser } from '../Parser';
import { Mod } from '../../schema/VehiclesSchema';
import { CompendiumKey } from '../../importer/Constants';
import { ImportHelper as IH } from '../../helper/ImportHelper';
import { ChummerFormulaParser } from '../../helper/ChummerFormula';

export class VehicleModParser extends Parser<'modification'> {
    protected readonly parseType = 'modification';

    protected override formulaIdentifiers(system: object) {
        return { ...super.formulaIdentifiers(system), ...ChummerFormulaParser.VEHICLE };
    }

    protected override getSystem(jsonData: Mod) {
        const system = this.getBaseSystem();
        system.type = 'vehicle';

        system.modification_category = jsonData.category._TEXT?.toLowerCase() as any;

        const slots = Number(jsonData.slots._TEXT);
        if (Number.isFinite(slots))
            system.slots = slots;

        return system;
    }

    protected override async getFolder(jsonData: Mod, compendiumKey: CompendiumKey): Promise<Folder> {
        const category = jsonData.category._TEXT;
        const rootFolder = "Vehicle-Mods";
        const folderName = IH.getTranslatedCategory('vehicles', category);

        return IH.getFolder(compendiumKey, rootFolder, folderName);
    }
}
