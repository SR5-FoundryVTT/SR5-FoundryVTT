import { ImportHelper } from '../../helper/ImportHelper';
import MountType = Shadowrun.MountType;
import { TechnologyItemParserBase } from '../item/TechnologyItemParserBase';
import ModificationItemData = Shadowrun.ModificationItemData;

export class WeaponModParserBase extends TechnologyItemParserBase<ModificationItemData> {
    override Parse(jsonData: object, item: ModificationItemData): ModificationItemData {
        item = super.Parse(jsonData, item);

        item.system.type = 'weapon';

        item.system.mount_point = ImportHelper.StringValue(jsonData, 'mount')?.toLowerCase() as MountType;

        item.system.rc = ImportHelper.IntValue(jsonData, 'rc', 0);
        item.system.accuracy = ImportHelper.IntValue(jsonData, 'accuracy', 0);

        item.system.technology.conceal.base = ImportHelper.IntValue(jsonData, 'conceal', 0);

        return item;
    }
}
