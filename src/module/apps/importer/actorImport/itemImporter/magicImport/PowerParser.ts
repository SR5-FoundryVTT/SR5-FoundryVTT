import { formatAsSlug, genImportFlags, setSubType } from "../importHelper/BaseParserFunctions"
import { BlankItem, ExtractItemType, Parser } from "../Parser";

export class PowerParser extends Parser<'adept_power'> {
    protected readonly parseType = 'adept_power';
    protected readonly compKey = 'Adept_Power';

    protected parseItem(item: BlankItem<'adept_power'>, itemData: ExtractItemType<'powers', 'power'>) {
        const system = item.system;

        system.level = parseInt(itemData.rating);
        system.pp = parseFloat(itemData.totalpoints);

        // Assign import flags
        system.importFlags = genImportFlags(formatAsSlug(itemData.fullname), this.parseType);
        if (itemData.name !== itemData.fullname) {
            setSubType(system, this.parseType, formatAsSlug(itemData.name));
            if (system.importFlags.subType && itemData.extra_english) {
                system.importFlags.name = formatAsSlug(itemData.extra_english);
            }
        }
    }
}
