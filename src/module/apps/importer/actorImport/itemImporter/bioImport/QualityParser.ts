import { formatAsSlug, genImportFlags, setSubType } from "../importHelper/BaseParserFunctions"
import { BlankItem, ExtractItemType, Parser } from "../Parser";

export class QualityParser extends Parser<'quality'> {
    protected readonly parseType = 'quality';
    protected readonly compKey = 'Quality';

    protected parseItem(item: BlankItem<'quality'>, itemData: ExtractItemType<'qualities', 'quality'>) {
        const system = item.system;

        system.type = itemData.qualitytype_english.toLowerCase() as any;
        system.rating = Number(itemData.extra) || 0;
        system.karma = (Number(itemData.bp) || 0) * Math.max(system.rating, 1);

        // Assign import flags
        system.importFlags = genImportFlags(formatAsSlug(itemData.name_english), this.parseType);
        setSubType(system, this.parseType, formatAsSlug(system.type)); // positive or negative
    }
}
