import { Parser } from '../Parser';
import { CompendiumKey } from '../../importer/Constants';
import { ImportHelper as IH } from '../../helper/ImportHelper';
import { Bioware, BiowareSchema } from '../../schema/BiowareSchema';
import { Cyberware, CyberwareSchema } from '../../schema/CyberwareSchema';

type WareType = 'bioware' | 'cyberware';

export class WareModParser extends Parser<'modification'> {
    protected readonly parseType = 'modification';
    protected categories: (BiowareSchema | CyberwareSchema)['categories']['category'];
    protected wareType: WareType;

    constructor(
        wareType: WareType,
        categories: (BiowareSchema | CyberwareSchema)['categories']['category']
    ) {
        super();
        this.wareType = wareType;
        this.categories = categories;
    }

    protected override getSystem(jsonData: Bioware | Cyberware) {
        const system = this.getBaseSystem();

        system.type = 'ware';
        system.slots = parseInt(jsonData.capacity._TEXT.replace(/[[\]]/g, '')) || 0;
        
        if ('addtoparentess' in jsonData) {
            system.essence = parseFloat(jsonData.ess._TEXT) || 0;
        }

        if (this.wareType === 'bioware') {
            system.technology.wireless = 'none';
        }

        return system;
    }

    protected override async getFolder(jsonData: Bioware | Cyberware, compendiumKey: CompendiumKey): Promise<Folder> {
        let rootFolder = "Other";
        const categoryData = jsonData.category._TEXT;
        const folderName = IH.getTranslatedCategory(this.wareType, categoryData);

        for (const category of this.categories) {
            if (category._TEXT === categoryData) {
                rootFolder = category.$.blackmarket;
            }
        }

        const wareFolder = this.wareType === 'cyberware' ? 'Cyberware-Mods' : 'Bioware-Mods';
        return IH.getFolder(compendiumKey, wareFolder, rootFolder, folderName);
    }
}
