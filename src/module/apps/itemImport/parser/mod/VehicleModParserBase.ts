import { ImportHelper } from '../../helper/ImportHelper';
import ModificationCategoryType = Shadowrun.ModificationCategoryType;
import { TechnologyItemParserBase } from '../item/TechnologyItemParserBase';
import ModificationItemData = Shadowrun.ModificationItemData;

export class VehicleModParserBase extends TechnologyItemParserBase<ModificationItemData> {
    override Parse(jsonData: object, item: ModificationItemData): ModificationItemData {
        item = super.Parse(jsonData, item);

        item.system.type = 'vehicle';

        const categoryName = ImportHelper.StringValue(jsonData, 'category');
        const enhancement  = ["Acceleration", "Armor", "Handling", "Sensor", "Speed"];

        item.system.modification_category = (
            categoryName === undefined         ? "" :
            categoryName === "All"             ? "exotic" :
            categoryName === "Model-Specific"  ? "exotic" :
            categoryName === "Powertrain"      ? "power_train" :
            enhancement.includes(categoryName) ? "enhancement"
                                               : categoryName.toLowerCase()
        ) as ModificationCategoryType;

        item.system.slots = +ImportHelper.StringValue(jsonData, 'slots') || 0;

        return item;
    }
}
