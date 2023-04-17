import { ImportHelper } from '../../helper/ImportHelper';
import { TechnologyItemParserBase } from '../item/TechnologyItemParserBase';
import ArmorItemData = Shadowrun.ArmorItemData;

export class ArmorParserBase extends TechnologyItemParserBase<ArmorItemData> {
    override Parse(jsonData: object, item: ArmorItemData): ArmorItemData {
        item = super.Parse(jsonData, item);

        item.system.armor.value = ImportHelper.IntValue(jsonData, 'armor', 0);
        item.system.armor.mod = ImportHelper.StringValue(jsonData, 'armor').includes('+');

        return item;
    }
}
