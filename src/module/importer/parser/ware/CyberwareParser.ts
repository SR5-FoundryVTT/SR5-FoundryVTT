import { ImportHelper } from '../../helper/ImportHelper';
import { TechnologyItemParserBase } from '../item/TechnologyItemParserBase';
import Ware = Shadowrun.WareItemData;

export class CyberwareParser extends TechnologyItemParserBase<Ware> {
    Parse(jsonData: object, data: Ware, jsonTranslation?: object): Ware {
        data = super.Parse(jsonData, data, jsonTranslation);

        const essence = ImportHelper.StringValue(jsonData, 'ess', '0').match(/[0-9]\.?[0-9]*/g);
        if (essence !== null) {
            data.data.essence = parseFloat(essence[0]);
        }

        const capacity = ImportHelper.StringValue(jsonData, 'capacity', '0').match(/[0-9]+/g);
        if (capacity !== null) {
            data.data.capacity = parseInt(capacity[0]);
        }

        return data;
    }
}
