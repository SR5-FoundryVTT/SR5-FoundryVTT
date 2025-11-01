import { formatAsSlug, genImportFlags, setSubType } from "../importHelper/BaseParserFunctions"
import { BlankItem, ExtractItemType, Parser } from "../Parser";

export class ComplexFormParser extends Parser<'complex_form'> {
    protected readonly parseType = 'complex_form';

    protected parseItem(item: BlankItem<'complex_form'>, itemData: ExtractItemType<'complexforms', 'complexform'>) {
        const system = item.system;

        if (itemData.fv_english) {
            system.fade = Number(itemData.fv_english.substring(1)) || 0;
        }

        system.target = ['Device', 'File', 'Host', 'Persona', 'Self', 'Sprite'].includes(itemData.target_english)
            ? itemData.target_english.toLowerCase() as typeof system.target
            : 'other';

        const duration = itemData.duration_english;
        if (duration === 'I')
            system.duration = 'instant';
        else if (duration === 'S')
            system.duration = 'sustained';
        else if (duration === 'P')
            system.duration = 'permanent';

        // Assign import flags
        system.importFlags = genImportFlags(formatAsSlug(itemData.fullname), this.parseType);
        if (itemData.name_english !== itemData.fullname) {
            setSubType(system, this.parseType, formatAsSlug(itemData.name_english));
        }
    }
}
