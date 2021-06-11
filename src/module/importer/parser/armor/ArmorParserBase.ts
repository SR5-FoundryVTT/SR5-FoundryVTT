import { ImportHelper } from '../../helper/ImportHelper';
import { TechnologyItemParserBase } from '../item/TechnologyItemParserBase';
import ArmorItemData = Shadowrun.ArmorItemData;

export class ArmorParserBase extends TechnologyItemParserBase<ArmorItemData> {
    Parse(jsonData: object, data: ArmorItemData): ArmorItemData {
        data = super.Parse(jsonData, data);

        data.data.armor.value = ImportHelper.IntValue(jsonData, 'armor', 0);
        data.data.armor.mod = ImportHelper.StringValue(jsonData, 'armor').includes('+');

        return data;
    }
}
