import { BlankItem, ExtractItemType, Parser } from "../Parser";
import { Parser as ItemParser } from "@/module/apps/itemImport/parser/Parser";

type Unwrap<T> = T extends Array<infer U> ? U : T;
type AccessoryType = Unwrap<NonNullable<ExtractItemType<'weapons', 'weapon'>['accessories']>['accessory']>;

/**
 * Parses ammunition
 */
export class AccessoryParser extends Parser<'modification'> {
    protected readonly parseType = 'modification';

    protected parseItem(item: BlankItem<'modification'>, itemData: AccessoryType) {
        const system = item.system;
        system.type = 'weapon';
        system.mod_weapon.mount_point = itemData.mount.toLowerCase() as any;
        system.mod_weapon.accuracy = Number(itemData.accuracy) || 0;
        system.mod_weapon.rc = Number(itemData.rc) || 0;
        system.mod_weapon.conceal = Number(itemData.conceal) || 0;
        system.technology.equipped = true;

        // The weapon's exported availability already includes its accessories.
        if (itemData.included === 'True')
            ItemParser.includeInParent(item as unknown as Item.Source);
        else
            ItemParser.dropChanges(item as unknown as Item.Source, ['parent_item']);
    }
}
