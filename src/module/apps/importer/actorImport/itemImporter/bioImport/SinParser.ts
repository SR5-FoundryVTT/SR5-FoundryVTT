import { formatAsSlug, genImportFlags } from "../importHelper/BaseParserFunctions"
import { BlankItem, ExtractItemType, Parser } from "../Parser";
import { ImportHelper as IH } from "@/module/apps/itemImport/helper/ImportHelper";

/**
 * Parses SINs and the attached licenses.
 * Licenses that are not attached to a SIN are not handled.
 */
export class SinParser extends Parser<'sin'> {
    protected readonly parseType = 'sin';
    protected readonly compKey = null;

    protected parseItem(item: BlankItem<'sin'>, itemData: ExtractItemType<'gears', 'gear'>) {
        const system = item.system;

        // Create licenses if there are any
        if (itemData.children)
            system.licenses = this.parseLicenses(itemData.children);

        // Assign import flags
        system.importFlags = genImportFlags(formatAsSlug(itemData.name_english), this.parseType);
    }

    private parseLicenses(licensesData: ExtractItemType<'gears', 'gear'>['children']) {
        const licenses: BlankItem<'sin'>['system']['licenses'] = [];

        for (const licenseData of IH.getArray(licensesData?.gear)) {
            if (licenseData.category_english === 'ID/Credsticks') {
                licenses.push({
                    name: licenseData.extra || "Unnamed",
                    rtg: Number(licenseData.rating) || 0,
                    description: ''
                });
            }
        }

        return licenses;
    }
}
