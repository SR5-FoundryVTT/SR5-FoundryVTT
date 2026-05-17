import { ImportHelper as IH } from "@/module/apps/itemImport/helper/ImportHelper";
import { BlankItem, ExtractItemType, Parser } from "../Parser";

export class ArmorParser extends Parser<'armor'> {
    protected readonly parseType = 'armor';

    protected parseItem(item: BlankItem<'armor'>, itemData: ExtractItemType<'armors', 'armor'>) {
        const system = item.system;
        const armor = system.armor;

        armor.base = parseInt(itemData.armor) || 0;
        armor.accessory = itemData.armor.includes('+');
    }
}
