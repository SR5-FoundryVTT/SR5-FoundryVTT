import { Parser } from '../Parser';
import { ImportHelper } from '../../helper/ImportHelper';
import ShadowrunItemData = Shadowrun.ShadowrunItemData;

export abstract class ItemParserBase<TResult extends ShadowrunItemData> extends Parser<TResult> {
    Parse(jsonData: object, item: TResult, jsonTranslation?: object): TResult {
        // @ts-ignore // TODO: Foundry Where is my foundry base data?
        item.name = ImportHelper.StringValue(jsonData, 'name');

        item.system.description.source = `${ImportHelper.StringValue(jsonData, 'source')} ${ImportHelper.StringValue(jsonData, 'page')}`;

        if (jsonTranslation) {
            const origName = ImportHelper.StringValue(jsonData, 'name');
            // @ts-ignore // TODO: Foundry Where is my foundry base data?
            item.name = ImportHelper.MapNameToTranslation(jsonTranslation, origName);
            item.system.description.source = `${ImportHelper.StringValue(jsonData, 'source')} ${ImportHelper.MapNameToPageSource(jsonTranslation, origName)}`;
        }

        return item;
    }
}
