import { ImportHelper } from '../../helper/ImportHelper';
import ModificationCategoryType = Shadowrun.ModificationCategoryType;
import { TechnologyItemParserBase } from '../item/TechnologyItemParserBase';
import { Mod } from '../../schema/VehiclesSchema';
import ModificationItemData = Shadowrun.ModificationItemData;

export class VehicleModParserBase extends TechnologyItemParserBase<ModificationItemData> {
    override Parse(jsonData: Mod, item: ModificationItemData): ModificationItemData {
        item = super.Parse(jsonData, item);

        item.system.type = 'vehicle';

        const categoryName = jsonData.category._TEXT;

        item.system.modification_category = categoryName.toLowerCase() as ModificationCategoryType;

        item.system.slots = +jsonData.slots;

        return item;
    }
}
