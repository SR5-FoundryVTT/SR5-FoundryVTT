import { ItemParserBase } from './ItemParserBase';
import { ImportHelper } from '../../helper/ImportHelper';
import ShadowrunTechnologyItemData = Shadowrun.ShadowrunTechnologyItemData;

export abstract class TechnologyItemParserBase<TResult extends ShadowrunTechnologyItemData> extends ItemParserBase<TResult> {
    override Parse(jsonData: object, item: TResult, jsonTranslation?: object): TResult {
        item = super.Parse(jsonData, item, jsonTranslation);

        item.system.technology.availability.base = item.system.technology.availability.value = ImportHelper.StringValue(jsonData, 'avail', '0');
        item.system.technology.cost.base = item.system.technology.cost.value = ImportHelper.IntValue(jsonData, 'cost', 0);
        item.system.technology.rating = ImportHelper.IntValue(jsonData, 'rating', 0);

        return item;
    }
}
