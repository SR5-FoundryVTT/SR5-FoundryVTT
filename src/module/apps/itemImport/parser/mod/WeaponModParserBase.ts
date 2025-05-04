import { ImportHelper } from '../../helper/ImportHelper';
import MountType = Shadowrun.MountType;
import { TechnologyItemParserBase } from '../item/TechnologyItemParserBase';
import { Accessory } from '../../schema/WeaponsSchema';
import ModificationItemData = Shadowrun.ModificationItemData;

export class WeaponModParserBase extends TechnologyItemParserBase<ModificationItemData> {
    override async Parse(jsonData: Accessory, item: ModificationItemData): Promise<ModificationItemData> {
        item = await super.Parse(jsonData, item);

        item.system.type = 'weapon';

        item.system.mount_point = jsonData.mount._TEXT?.toLowerCase() as MountType;

        item.system.rc = +(jsonData.rc?._TEXT ?? 0);
        item.system.accuracy = +(jsonData.accuracy?._TEXT ?? 0);

        item.system.technology.conceal.base = +(jsonData.conceal?._TEXT ?? 0);

        return item;
    }
}
