import { formatAsSlug, genImportFlags } from "../importHelper/BaseParserFunctions"
import { BlankItem, ExtractItemType, Parser } from "../Parser";

export class ContactParser extends Parser<'contact'> {
    protected readonly parseType = 'contact';
    protected readonly compKey = null;

    protected parseItem(item: BlankItem<'contact'>, itemData: ExtractItemType<'contacts', 'contact'>) {
        const system = item.system;
        item.name ||= '[Unnamed connection]';

        system.type = itemData.role || '';

        // Group contacts are stored in chummer as 'Group(connectionRating)', e.g. 'Group(5)'
        // We handle group contacts as normal contacts until they are supported in the codebase.
        if (itemData.connection.toLowerCase().includes('group')) {
            system.connection = Number(itemData.connection
                .toLowerCase()
                .replace('group(', '')
                .replace(')', '')) || 0;
        }
        else {
            system.connection = Number(itemData.connection) || 0;
        }

        system.loyalty = Number(itemData.loyalty) || 0;
        system.family = itemData.family === 'True';
        system.blackmail = itemData.blackmail === 'True';


        // Assign import flags
        system.importFlags = genImportFlags(formatAsSlug(item.name), this.parseType);
    }
}
