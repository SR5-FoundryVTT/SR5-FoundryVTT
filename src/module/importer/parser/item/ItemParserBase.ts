import { Parser } from '../Parser';
import { ImportHelper } from '../../helper/ImportHelper';
import SR5ItemType = Shadowrun.SR5ItemType;

export abstract class ItemParserBase<TResult extends SR5ItemType> extends Parser<TResult> {
    Parse(jsonData: object, data: TResult, jsonTranslation?: object): TResult {
        data.name = ImportHelper.StringValue(jsonData, 'name');

        data.data.description.source = `${ImportHelper.StringValue(jsonData, 'source')} ${ImportHelper.StringValue(jsonData, 'page')}`;

        if (jsonTranslation) {
            const origName = ImportHelper.StringValue(jsonData, 'name');
            data.name = ImportHelper.MapNameToTranslation(jsonTranslation, origName);
            data.data.description.source = `${ImportHelper.StringValue(jsonData, 'source')} ${ImportHelper.MapNameToPageSource(jsonTranslation, origName)}`;
        }

        return data;
    }
}
