import { Parser } from '../Parser';
import { ImportHelper } from '../../helper/ImportHelper';
import ShadowrunItemData = Shadowrun.ShadowrunItemData;

export abstract class ItemParserBase<TResult extends ShadowrunItemData> extends Parser<TResult> {
    Parse(jsonData: object, data: TResult, jsonTranslation?: object): TResult {
        // @ts-ignore // TODO: Foundry Where is my foundry base data?
        data.name = ImportHelper.StringValue(jsonData, 'name');

        data.data.description.source = `${ImportHelper.StringValue(jsonData, 'source')} ${ImportHelper.StringValue(jsonData, 'page')}`;

        if (jsonTranslation) {
            const origName = ImportHelper.StringValue(jsonData, 'name');
            // @ts-ignore // TODO: Foundry Where is my foundry base data?
            data.name = ImportHelper.MapNameToTranslation(jsonTranslation, origName);
            data.data.description.source = `${ImportHelper.StringValue(jsonData, 'source')} ${ImportHelper.MapNameToPageSource(jsonTranslation, origName)}`;
        }

        return data;
    }
}
