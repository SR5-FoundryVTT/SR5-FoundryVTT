import { ItemParserBase } from './ItemParserBase';
import { ImportHelper } from '../../helper/ImportHelper';
import ShadowrunTechnologyItemData = Shadowrun.ShadowrunTechnologyItemData;

export abstract class TechnologyItemParserBase<TResult extends ShadowrunTechnologyItemData> extends ItemParserBase<TResult> {
    Parse(jsonData: object, item: TResult, jsonTranslation?: object): TResult {
        item = super.Parse(jsonData, item, jsonTranslation);

        item.system.technology.availability = ImportHelper.StringValue(jsonData, 'avail', '0');
        item.system.technology.cost = ImportHelper.IntValue(jsonData, 'cost', 0);
        item.system.technology.rating = ImportHelper.IntValue(jsonData, 'rating', 0);

        return item;
    }
}
