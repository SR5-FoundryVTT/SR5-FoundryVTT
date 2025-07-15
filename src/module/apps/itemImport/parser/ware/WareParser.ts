import { Parser } from '../Parser';
import { CompendiumKey } from '../../importer/Constants';
import { ImportHelper as IH } from '../../helper/ImportHelper';
import { Bioware, BiowareSchema } from '../../schema/BiowareSchema';
import { TranslationHelper as TH } from '../../helper/TranslationHelper';
import { Cyberware, CyberwareSchema } from '../../schema/CyberwareSchema';
import Ware = Shadowrun.WareItemData;

export class WareParser extends Parser<Ware> {
    protected override parseType: string;
    protected categories: (BiowareSchema | CyberwareSchema)['categories']['category'];
    
    constructor(
        parseType: 'bioware' | 'cyberware',
        categories: (BiowareSchema | CyberwareSchema)['categories']['category']
    ) {
        super(); this.parseType = parseType; this.categories = categories;
    }

    protected override getSystem(jsonData: Bioware | Cyberware): Ware['system'] {
        const system = this.getBaseSystem();

        const essence = (jsonData.ess._TEXT || '0').match(/[0-9]\.?[0-9]*/g);
        if (essence)
            system.essence = parseFloat(essence[0]);

        const capacity = (jsonData.capacity._TEXT || '0').match(/[0-9]+/g);
        if (capacity)
            system.capacity = parseInt(capacity[0]);

        return system;
    }

    protected override async getFolder(jsonData: Bioware | Cyberware, compendiumKey: CompendiumKey): Promise<Folder> {
        let rootFolder: string = "Other";
        const categoryData = jsonData.category._TEXT;
        const folderName = TH.getTranslation(categoryData, {type: 'category'});

        for (const category of this.categories)
            if (category._TEXT === categoryData)
                rootFolder = category.$.blackmarket;

        return IH.getFolder(compendiumKey, rootFolder, folderName);
    }
}
