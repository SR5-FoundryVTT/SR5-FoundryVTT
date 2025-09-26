import { Parser } from "../Parser";
import { CompendiumKey } from "../../importer/Constants";
import { Gear, GearSchema } from "../../schema/GearSchema";
import { ImportHelper as IH } from "../../helper/ImportHelper";

export class ProgramParser extends Parser<'program'> {
    protected readonly parseType = 'program';
    protected readonly categories: GearSchema['categories']['category'];

    constructor(categories: GearSchema['categories']['category']) {
        super(); this.categories = categories;
    }

    protected override getSystem(jsonData: Gear) {
        const programCategories = {
            'Hacking Programs': 'hacking_program',
            'Common Programs': 'common_program'
        } as const;

        const system = this.getBaseSystem();

        system.type = programCategories[jsonData.category._TEXT];

        return system;
    }

    protected override async getFolder(jsonData: Gear, compendiumKey: CompendiumKey): Promise<Folder> {
        const categoryData = jsonData.category._TEXT;
        const rootFolder = IH.getTranslatedCategory('gear', 'Software');
        const folderName = IH.getTranslatedCategory("gear", categoryData);

        return IH.getFolder(compendiumKey, rootFolder, folderName);
    }
}
