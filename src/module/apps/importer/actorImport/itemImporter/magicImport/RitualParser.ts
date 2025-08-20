import { formatAsSlug, genImportFlags, setSubType } from "../importHelper/BaseParserFunctions";
import { BlankItem, ExtractItemType, Parser } from "../Parser";

export class RitualParser extends Parser<'ritual'> {
    protected readonly parseType = 'ritual';
    protected readonly compKey = 'Spell';

    protected parseItem(item: BlankItem<'ritual'>, itemData: ExtractItemType<'spells', 'spell'>) {
        const system = item.system;

        system.type = itemData.type === 'M' ? 'mana' : 'physical';
        system.descriptors = itemData.descriptors;

        system.action.type = 'varies';
        system.action.skill = 'ritual_spellcasting';
        system.action.attribute = 'magic';

        // Assign import flags
        system.importFlags = genImportFlags(formatAsSlug(itemData.name_english), this.parseType);
        setSubType(system, this.parseType, formatAsSlug(itemData.category_english));
    }
}
