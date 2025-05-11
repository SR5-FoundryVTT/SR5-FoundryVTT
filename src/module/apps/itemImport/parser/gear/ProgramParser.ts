import { Parser } from "../Parser";
import { Gear, GearSchema } from "../../schema/GearSchema";
import { ImportHelper as IH } from "../../helper/ImportHelper";
import { TranslationHelper as TH } from "../../helper/TranslationHelper";
import ProgramItemData = Shadowrun.ProgramItemData;

export class ProgramParser extends Parser<ProgramItemData> {
    protected override parseType: string = 'program';
    protected categories: GearSchema['categories']['category'];

    constructor(categories: GearSchema['categories']['category']) {
        super(); this.categories = categories;
    }

    protected override getSystem(jsonData: Gear): ProgramItemData['system'] {
        const programCategories = {
            'Hacking Programs': 'hacking_program',
            'Common Programs': 'common_program'
        } as const;

        const system = this.getBaseSystem();

        system.type = programCategories[jsonData.category._TEXT];

        return system;
    }

    protected override async getFolder(jsonData: Gear): Promise<Folder> {
        const categoryData = jsonData.category._TEXT;
        const rootFolder = TH.getTranslation('Software', {type: 'category'})
        const folderName = TH.getTranslation(categoryData, {type: 'category'});

        return IH.getFolder('Gear', rootFolder, folderName);
    }
}