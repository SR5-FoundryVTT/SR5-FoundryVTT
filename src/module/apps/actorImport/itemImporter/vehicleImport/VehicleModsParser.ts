import { BlankItem, ExtractItemType, Parser, Unwrap } from "../Parser";
import { Parser as ItemParser } from "@/module/apps/itemImport/parser/Parser";

export default class VehicleModsParser extends Parser<'modification'> {
    protected readonly parseType = 'modification';

    protected parseItem(
        item: BlankItem<'modification'>,
        itemData: Unwrap<NonNullable<ExtractItemType<'vehicles', 'vehicle'>['mods']>['mod']>
    ) {
        const system = item.system;
        system.type = 'vehicle';

        // The vehicle's exported stats already include its mods' bonuses.
        if (itemData.included === 'True')
            ItemParser.includeInParent(item as unknown as Item.Source, { parentStats: true });
        else
            ItemParser.dropChanges(item as unknown as Item.Source, ['actor']);
    }
}
