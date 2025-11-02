import { BlankItem, ExtractItemType, Parser } from "../Parser";

export default class VehicleModsParser extends Parser<'modification'> {
    protected readonly parseType = 'modification';

    protected parseItem(item: BlankItem<'modification'>, itemData: ExtractItemType<'vehicles', 'vehicle'>) {
        const system = item.system;
        system.type = 'vehicle';
    }
}
