import { formatAsSlug, genImportFlags, setSubType } from "../importHelper/BaseParserFunctions"
import { BlankItem, ExtractItemType, Parser } from "../Parser";

export class CritterPowerParser extends Parser<'critter_power'> {
    protected readonly parseType = 'critter_power';
    protected readonly compKey = 'Critter_Power';

    protected parseItem(item: BlankItem<'critter_power'>, itemData: ExtractItemType<'critterpowers', 'critterpower'>) {
        const system = item.system;

        if (itemData.extra_english)
            system.rating = parseFloat(itemData.extra_english);

        system.powerType = itemData.type_english === "P" ? 'physical' : 'mana';
        if (itemData.range_english)
            system.range = itemData.range_english;

        if (itemData.duration_english)
            system.duration = itemData.duration_english;

        // Assign import flags
        system.importFlags = genImportFlags(formatAsSlug(itemData.fullname), this.parseType);
        if (itemData.name_english !== itemData.fullname) {
            setSubType(system, this.parseType, formatAsSlug(itemData.name_english));
            if (system.importFlags.subType && itemData.extra_english)
                system.importFlags.name = formatAsSlug(itemData.extra_english);
        }
    }
}
