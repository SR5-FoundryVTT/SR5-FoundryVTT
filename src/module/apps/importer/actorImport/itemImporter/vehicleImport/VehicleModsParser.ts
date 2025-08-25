import { formatAsSlug, genImportFlags, setSubType } from "../importHelper/BaseParserFunctions";
import { BlankItem, ExtractItemType, Parser } from "../Parser";

export default class VehicleModsParser extends Parser<'modification'> {
    protected readonly parseType = 'modification';
    protected readonly compKey = 'Vehicle_Mod';

    protected parseItem(item: BlankItem<'modification'>, itemData: ExtractItemType<'vehicles', 'vehicle'>) {
        const system = item.system;

        system.type = 'vehicle';

        // Assign import flags
        system.importFlags = genImportFlags(formatAsSlug(itemData.name_english), this.parseType);
        setSubType(system, this.parseType, formatAsSlug(itemData.category_english));
    }
}
