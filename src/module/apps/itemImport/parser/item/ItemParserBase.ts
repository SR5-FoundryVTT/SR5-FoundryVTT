import { Parser } from '../Parser';
import { ImportHelper } from '../../helper/ImportHelper';
import ShadowrunItemData = Shadowrun.ShadowrunItemData;
import { BonusHelper as BH } from '../../helper/BonusHelper';

export abstract class ItemParserBase<TResult extends ShadowrunItemData> extends Parser<TResult> {
    async Parse(jsonData: object, item: TResult, jsonTranslation?: object): Promise<TResult> {
        item.name = ImportHelper.StringValue(jsonData, 'name');
        item.system.description.source = `${ImportHelper.StringValue(jsonData, 'source')} ${ImportHelper.StringValue(jsonData, 'page')}`;

        //@ts-expect-error
        if (jsonData.bonus) await BH.addBonus(item, jsonData.bonus);

        if (jsonTranslation) {
            const origName = ImportHelper.StringValue(jsonData, 'name');
            item.name = ImportHelper.MapNameToTranslation(jsonTranslation, origName);
            item.system.description.source = `${ImportHelper.StringValue(jsonData, 'source')} ${ImportHelper.MapNameToPageSource(jsonTranslation, origName)}`;
        }

        return item;
    }
}
