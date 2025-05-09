import { Parser } from '../Parser';
import { Quality } from '../../schema/QualitiesSchema';
import { ImportHelper as IH } from '../../helper/ImportHelper';
import { TranslationHelper as TH } from '../../helper/TranslationHelper';
import QualityItemData = Shadowrun.QualityItemData;

export class QualityParser extends Parser<QualityItemData> {
    protected override parseType: string = 'quality';

    protected override getSystem(jsonData: Quality): QualityItemData['system'] {
        const system = this.getBaseSystem('Item');

        system.type = jsonData.category._TEXT === 'Positive' ? 'positive' : 'negative';
        system.karma = Number(jsonData.karma._TEXT) || 0;

        return system;
    }

    protected override async getFolder(jsonData: Quality): Promise<Folder> {
        const rootFolder = TH.getTranslation('Quality', {type: 'category'});
        const folderName = TH.getTranslation(jsonData.category._TEXT, {type: 'category'});

        return IH.getFolder('Trait', rootFolder, folderName);
    }
}
