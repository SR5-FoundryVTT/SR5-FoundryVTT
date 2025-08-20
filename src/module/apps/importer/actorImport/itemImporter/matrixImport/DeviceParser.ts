import { formatAsSlug, genImportFlags, setSubType } from "../importHelper/BaseParserFunctions";
import { BlankItem, ExtractItemType, Parser } from "../Parser";

/**
 * Parses devices (commlinks, decks, and RCCs)
 */
export class DeviceParser extends Parser<'device'> {
    protected readonly parseType = 'device';
    protected readonly compKey = null;

    protected parseItem(item: BlankItem<'device'>, itemData: ExtractItemType<'gears', 'gear'>) {
        const system = item.system;

        system.technology.rating = Number(itemData.devicerating) || 0;

        system.atts.att1.value = Number(itemData.attack) || 0;
        system.atts.att2.value = Number(itemData.sleaze) || 0;
        system.atts.att3.value = Number(itemData.dataprocessing) || 0;
        system.atts.att4.value = Number(itemData.firewall) || 0;

        system.atts.att1.att = 'attack';
        system.atts.att2.att = 'sleaze';
        system.atts.att3.att = 'data_processing';
        system.atts.att4.att = 'firewall';
        // Map Chummer gear categories to internal system categories
        const categoryMap = {
            Cyberdecks: 'cyberdeck',
            Commlinks: 'commlink',
            'Rigger Command Consoles': 'rcc',
            Entertainment: 'commlink', // prepaid commlinks
        } as const;
        system.category = categoryMap[itemData.category_english as keyof typeof categoryMap] ?? 'commlink';

        // Assign import flags
        system.importFlags = genImportFlags(formatAsSlug(itemData.name_english), this.parseType);
        setSubType(system, this.parseType, system.category);
    }
}
