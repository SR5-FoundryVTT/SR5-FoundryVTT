import { BlankItem, ExtractItemType, Parser } from "../Parser";

export class PowerParser extends Parser<'adept_power'> {
    protected readonly parseType = 'adept_power';

    protected parseItem(item: BlankItem<'adept_power'>, itemData: ExtractItemType<'powers', 'power'>) {
        const system = item.system;

        system.level = parseInt(itemData.rating);
        system.pp = parseFloat(itemData.totalpoints);
    }
}
