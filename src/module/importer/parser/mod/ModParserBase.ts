import Mod = Shadowrun.Modification;
import { ImportHelper } from '../../helper/ImportHelper';
import MountType = Shadowrun.MountType;
import { TechnologyItemParserBase } from '../item/TechnologyItemParserBase';

export class ModParserBase extends TechnologyItemParserBase<Mod> {
    Parse(jsonData: object, data: Mod): Mod {
        data = super.Parse(jsonData, data);

        data.data.type = 'weapon';

        data.data.mount_point = ImportHelper.StringValue(jsonData, 'mount') as MountType;

        data.data.rc = ImportHelper.IntValue(jsonData, 'rc', 0);
        data.data.accuracy = ImportHelper.IntValue(jsonData, 'accuracy', 0);

        data.data.technology.conceal.base = ImportHelper.IntValue(jsonData, 'conceal', 0);

        return data;
    }
}
