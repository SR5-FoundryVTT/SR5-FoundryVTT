import { formatAsSlug, genImportFlags } from "../importHelper/BaseParserFunctions"
import { BlankItem, ExtractItemType, Parser } from "../Parser";
import { SR5 } from "../../../../../config";

export class LifestyleParser extends Parser<'lifestyle'> {
    protected readonly parseType = 'lifestyle';
    protected readonly compKey = null;

    protected parseItem(item: BlankItem<'lifestyle'>, itemData: ExtractItemType<'lifestyles', 'lifestyle'>) {
        const system = item.system;

        // Advanced lifestyles and lifestyle qualities are not supported at the moment
        // Map the chummer lifestyle type to our sr5 foundry type.
        const chummerLifestyleType = itemData.baselifestyle.toLowerCase();
        if (SR5.lifestyleTypes[chummerLifestyleType]) {
            system.type = chummerLifestyleType;
        } else if (chummerLifestyleType === 'luxury') {
            system.type = 'luxory'; // typo in SR5 config
        } else {
            system.type = 'other';
        }

        system.cost = Number(itemData.totalmonthlycost) || 0;
        system.permanent = itemData.purchased === 'True';

        // The name of the lifestyle is optional, so we use a fallback here.
        item.name ||= itemData.baselifestyle;

        // Assign import flags
        system.importFlags = genImportFlags(formatAsSlug(item.name), this.parseType);
    }
}
