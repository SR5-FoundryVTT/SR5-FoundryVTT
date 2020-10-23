import { ImportHelper } from '../../helper/ImportHelper';
import Quality = Shadowrun.Quality;
import { ItemParserBase } from '../item/ItemParserBase';

export class QualityParserBase extends ItemParserBase<Quality> {
    public Parse(jsonData: object, data: Quality, jsonTranslation?): Quality {
        data.name = ImportHelper.StringValue(jsonData, 'name');

        data.data.description.source = `${ImportHelper.StringValue(jsonData, 'source')} ${ImportHelper.StringValue(jsonData, 'page')}`;

        data.data.type = ImportHelper.StringValue(jsonData, 'category') === 'Positive' ? 'positive' : 'negative';

        if (jsonTranslation) {
            const origName = ImportHelper.StringValue(jsonData, 'name');
            data.name = ImportHelper.MapNameToTranslation(jsonTranslation, origName);
            data.data.description.source = `${ImportHelper.StringValue(jsonData, 'source')} ${ImportHelper.MapNameToPageSource(jsonTranslation, origName)}`;
        }

        return data;
    }
}
