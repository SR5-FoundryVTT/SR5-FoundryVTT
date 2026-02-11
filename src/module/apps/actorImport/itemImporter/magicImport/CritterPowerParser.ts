import { BlankItem, ExtractItemType, Parser } from "../Parser";

export class CritterPowerParser extends Parser<'critter_power'> {
    protected readonly parseType = 'critter_power';

    protected parseItem(item: BlankItem<'critter_power'>, itemData: ExtractItemType<'critterpowers', 'critterpower'>) {
        const system = item.system;

        if (itemData.extra_english)
            system.rating = parseFloat(itemData.extra_english);

        system.powerType = itemData.type_english === "P" ? 'physical' : 'mana';

        const range = itemData.range_english ?? itemData.range ?? '';
        system.range = range === 'T'
            ? 'touch'
            : range.toLowerCase()
                .replace(/\s+/g, '_')
                .replace(/[()]/g, '') as any;

        const duration = (itemData.duration_english ?? itemData.duration ?? '').toLowerCase();
        if (duration === 's')
            system.duration = 'sustained';
        else if (duration === 'i')
            system.duration = 'instant';
        else if (duration === 'p')
            system.duration = 'permanent';
    }
}
