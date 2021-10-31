import { ImportHelper } from '../../helper/ImportHelper';
import { ItemParserBase } from '../item/ItemParserBase';
import QualityItemData = Shadowrun.QualityItemData;

export class QualityParserBase extends ItemParserBase<QualityItemData> {
    public Parse(jsonData: object, data: QualityItemData, jsonTranslation?): QualityItemData {
        // @ts-ignore // TODO: Foundry Where is my foundry base data?
        data.name = ImportHelper.StringValue(jsonData, 'name');

        data.data.description.source = `${ImportHelper.StringValue(jsonData, 'source')} ${ImportHelper.StringValue(jsonData, 'page')}`;

        data.data.type = ImportHelper.StringValue(jsonData, 'category') === 'Positive' ? 'positive' : 'negative';

        if (jsonTranslation) {
            const origName = ImportHelper.StringValue(jsonData, 'name');
            // @ts-ignore // TODO: Foundry Where is my foundry base data?
            data.name = ImportHelper.MapNameToTranslation(jsonTranslation, origName);
            data.data.description.source = `${ImportHelper.StringValue(jsonData, 'source')} ${ImportHelper.MapNameToPageSource(jsonTranslation, origName)}`;
        }

        return data;
    }
}
