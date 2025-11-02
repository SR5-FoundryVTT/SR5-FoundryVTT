import { BlankItem, ExtractItemType, Parser, Unwrap } from "../Parser";

export default class VehicleModsParser extends Parser<'modification'> {
    protected readonly parseType = 'modification';

    protected parseItem(
        item: BlankItem<'modification'>,
        itemData: Unwrap<NonNullable<ExtractItemType<'vehicles', 'vehicle'>['mods']>['mod']>
    ) {
        const system = item.system;
        system.type = 'vehicle';
    }
}
