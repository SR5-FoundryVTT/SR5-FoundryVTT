import { BlankItem, ExtractItemType, Parser } from "../Parser";

type Unwrap<T> = T extends Array<infer U> ? U : T;
type AccessoryType = Unwrap<NonNullable<ExtractItemType<'weapons', 'weapon'>['accessories']>['accessory']>;

/**
 * Parses ammunition
 */
export class AccessoryParser extends Parser<'modification'> {
    protected readonly parseType = 'modification';
    protected readonly compKey = 'Weapon_Mod';

    protected parseItem(item: BlankItem<'modification'>, itemData: AccessoryType) {
        const system = item.system;
        system.type = 'weapon';
        system.mount_point = itemData.mount.toLowerCase() as any;
        system.accuracy = Number(itemData.accuracy) || 0;
        system.rc = Number(itemData.rc) || 0;
        system.conceal = Number(itemData.conceal) || 0;
        system.technology.equipped = true;
    }
}
