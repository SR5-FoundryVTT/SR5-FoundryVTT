import { ImportHelper } from '../../helper/ImportHelper';
import { ItemParserBase } from '../item/ItemParserBase';
import QualityItemData = Shadowrun.QualityItemData;

export class QualityParserBase extends ItemParserBase<QualityItemData> {
    public override Parse(jsonData: object, item: QualityItemData, jsonTranslation?): QualityItemData {
        item.name = ImportHelper.StringValue(jsonData, 'name');

        item.system.description.source = `${ImportHelper.StringValue(jsonData, 'source')} ${ImportHelper.StringValue(jsonData, 'page')}`;

        item.system.type = ImportHelper.StringValue(jsonData, 'category') === 'Positive' ? 'positive' : 'negative';

        if (jsonTranslation) {
            const origName = ImportHelper.StringValue(jsonData, 'name');
            item.name = ImportHelper.MapNameToTranslation(jsonTranslation, origName);
            item.system.description.source = `${ImportHelper.StringValue(jsonData, 'source')} ${ImportHelper.MapNameToPageSource(jsonTranslation, origName)}`;
        }

        return item;
    }
}
