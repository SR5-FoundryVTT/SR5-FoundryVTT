import { Parser } from '../Parser';
import { Bioware } from '../../schema/BiowareSchema';
import { ImportHelper as IH } from '../../helper/ImportHelper';
import { TranslationHelper as TH } from '../../helper/TranslationHelper';
import Ware = Shadowrun.WareItemData;

export class BiowareParser extends Parser<Ware> {
    protected override parseType: string = 'bioware';

    protected override getSystem(jsonData: Bioware): Ware['system'] {
        const system = this.getBaseSystem();

        const essence = jsonData.ess._TEXT.match(/[0-9]\.?[0-9]*/g);
        if (essence)
            system.essence = parseFloat(essence[0]);

        const capacity = jsonData.capacity._TEXT.match(/[0-9]+/g);
        if (capacity)
            system.capacity = parseInt(capacity[0]);

        return system;
    }

    protected override async getFolder(jsonData: Bioware): Promise<Folder> {
        const rootFolder = TH.getTranslation('Bioware', {type: 'category'});
        const folderName = TH.getTranslation(jsonData.category._TEXT, {type: 'category'});

        return await IH.getFolder('Trait', rootFolder, folderName);
    }
}
