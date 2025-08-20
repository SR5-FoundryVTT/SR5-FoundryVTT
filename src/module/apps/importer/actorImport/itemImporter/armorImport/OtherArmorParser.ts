
import { formatAsSlug, genImportFlags, setSubType } from "../importHelper/BaseParserFunctions"
import { BlankItem, ExtractItemType, Parser } from "../Parser";

type MappedType = ExtractItemType<'otherarmors', 'otherarmor'> & {
    name: string, objectname: never,
    name_english: string, objectname_english: never,
    source: string, sourcename: never
};

export class OtherArmorParser extends Parser<'armor'> {
    protected readonly parseType = 'armor';
    protected readonly compKey = 'Armor';

    protected parseItem(item: BlankItem<'armor'>, itemData: MappedType) {
        const system = item.system;
        const armor = system.armor;

        armor.mod = itemData.armor.includes('+');
        armor.value = Number(itemData.armor) || 0;
        system.technology.equipped = true;

        // Assign import flags
        system.importFlags = genImportFlags(formatAsSlug(itemData.objectname_english), this.parseType);
        setSubType(system, this.parseType, formatAsSlug(itemData.improvesource));
    }
}
