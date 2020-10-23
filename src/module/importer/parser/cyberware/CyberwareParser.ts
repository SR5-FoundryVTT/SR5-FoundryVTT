import Cyberware = Shadowrun.Cyberware;
import { ImportHelper } from '../../helper/ImportHelper';
import { TechnologyItemParserBase } from '../item/TechnologyItemParserBase';

export class CyberwareParser extends TechnologyItemParserBase<Cyberware> {
    Parse(jsonData: object, data: Cyberware, jsonTranslation?: object): Cyberware {
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
