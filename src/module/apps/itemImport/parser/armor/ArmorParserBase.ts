import { ImportHelper } from '../../helper/ImportHelper';
import { TechnologyItemParserBase } from '../item/TechnologyItemParserBase';
import { Armor } from '../../schema/ArmorSchema'
import ArmorItemData = Shadowrun.ArmorItemData;

export class ArmorParserBase extends TechnologyItemParserBase<ArmorItemData> {
    override async Parse(jsonData: Armor, item: ArmorItemData): Promise<ArmorItemData> {
        item = await super.Parse(jsonData, item);

        item.system.armor.value = +jsonData.armor._TEXT;
        item.system.armor.mod = jsonData.armor._TEXT.includes('+');

        return item;
    }
}
