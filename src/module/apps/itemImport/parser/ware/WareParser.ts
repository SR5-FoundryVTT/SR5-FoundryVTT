import { Parser } from '../Parser';
import { CompendiumKey } from '../../importer/Constants';
import { ImportHelper as IH } from '../../helper/ImportHelper';
import { Bioware, BiowareSchema } from '../../schema/BiowareSchema';
import { Cyberware, CyberwareSchema } from '../../schema/CyberwareSchema';

export class WareParser extends Parser<'bioware' | 'cyberware'> {
    protected readonly parseType: 'bioware' | 'cyberware';
    protected categories: (BiowareSchema | CyberwareSchema)['categories']['category'];

    constructor(
        parseType: 'bioware' | 'cyberware',
        categories: (BiowareSchema | CyberwareSchema)['categories']['category']
    ) {
        super(); this.parseType = parseType; this.categories = categories;
    }

    protected override getSystem(jsonData: Bioware | Cyberware) {
        const system = this.getBaseSystem();

        const essence = Number(jsonData.ess._TEXT);
        if (Number.isFinite(essence))
            system.technology.essence.base = essence;

        const capacity = Number(jsonData.capacity._TEXT.replace(/^\[|\]$/g, ''));
        if (Number.isFinite(capacity))
            system.capacity.total = capacity;

        return system;
    }

    protected override async getFolder(jsonData: Bioware | Cyberware, compendiumKey: CompendiumKey): Promise<Folder> {
        let rootFolder = "Other";
        const categoryData = jsonData.category._TEXT;
        const folderName = IH.getTranslatedCategory(this.parseType, categoryData);

        for (const category of this.categories)
            if (category._TEXT === categoryData)
                rootFolder = category.$.blackmarket;

        return IH.getFolder(compendiumKey, rootFolder, folderName);
    }
}
