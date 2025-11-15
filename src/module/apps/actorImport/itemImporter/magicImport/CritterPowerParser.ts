import { BlankItem, ExtractItemType, Parser } from "../Parser";

export class CritterPowerParser extends Parser<'critter_power'> {
    protected readonly parseType = 'critter_power';

    protected parseItem(item: BlankItem<'critter_power'>, itemData: ExtractItemType<'critterpowers', 'critterpower'>) {
        const system = item.system;

        if (itemData.extra_english)
            system.rating = parseFloat(itemData.extra_english);

        system.powerType = itemData.type_english === "P" ? 'physical' : 'mana';
        if (itemData.range_english)
            system.range = itemData.range_english as any;

        if (itemData.duration_english)
            system.duration = itemData.duration_english as any;
    }
}
