import { formatAsSlug, genImportFlags, setSubType } from "../importHelper/BaseParserFunctions"
import { BlankItem, ExtractItemType, Parser } from "../Parser";

export class CritterPowerParser extends Parser<'critter_power'> {
    protected readonly parseType = 'critter_power';
    protected readonly compKey = 'Critter_Power';

    protected parseItem(item: BlankItem<'critter_power'>, itemData: ExtractItemType<'critterpowers', 'critterpower'>) {
        const system = item.system;

        system.rating = parseFloat(itemData.extra);
        system.powerType = itemData.type === "P" ? 'physical' : 'mana';
        system.range = itemData.range;
        system.duration = itemData.duration;

        // Assign import flags
        system.importFlags = genImportFlags(formatAsSlug(itemData.fullname), this.parseType);
        if (itemData.name_english !== itemData.fullname) {
            setSubType(system, this.parseType, formatAsSlug(itemData.name_english));
            if (system.importFlags.subType)
                system.importFlags.name = formatAsSlug(itemData.extra);
        }
    }
}
