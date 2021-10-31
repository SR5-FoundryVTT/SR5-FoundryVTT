import { ImportHelper } from '../../helper/ImportHelper';
import CritterPowerCategory = Shadowrun.CritterPowerCategory;
import { ItemParserBase } from '../item/ItemParserBase';
import CritterPowerItemData = Shadowrun.CritterPowerItemData;

export class CritterPowerParserBase extends ItemParserBase<CritterPowerItemData> {
    public Parse(jsonData: object, data: CritterPowerItemData, jsonTranslation?: object): CritterPowerItemData {
        // @ts-ignore // TODO: Foundry Where is my foundry base data?
        data.name = ImportHelper.StringValue(jsonData, 'name');

        data.data.description.source = `${ImportHelper.StringValue(jsonData, 'source')} ${ImportHelper.StringValue(jsonData, 'page')}`;
        data.data.category = ImportHelper.StringValue(jsonData, 'category').toLowerCase() as CritterPowerCategory;

        let duration = ImportHelper.StringValue(jsonData, 'duration');
        if (duration === 'Always') {
            data.data.duration = 'always';
        } else if (duration === 'Instant') {
            data.data.duration = 'instant';
        } else if (duration === 'Sustained') {
            data.data.duration = 'sustained';
        } else if (duration === 'Permanent') {
            data.data.duration = 'permanent';
        } else {
              data.data.duration = 'special';
        }

        let range = ImportHelper.StringValue(jsonData, 'range');
        if (range === 'T') {
            data.data.range = 'touch';
        } else if (range === 'LOS') {
            data.data.range = 'los';
        } else if (range === 'LOS (A)') {
            data.data.range = 'los_a';
        } else if (range === 'Self') {
           data.data.range = 'self';
        } else {
          data.data.range = 'special';
        }

        let type = ImportHelper.StringValue(jsonData, 'type');
        if (type === 'P') {
            data.data.powerType = 'physical';
        } else if (type === 'M') {
            data.data.powerType = 'mana';
        }

        if (jsonTranslation) {
            const origName = ImportHelper.StringValue(jsonData, 'name');
            // @ts-ignore // TODO: Foundry Where is my foundry base data?
            data.name = ImportHelper.MapNameToTranslation(jsonTranslation, origName);
            data.data.description.source = `${ImportHelper.StringValue(jsonData, 'source')} ${ImportHelper.MapNameToPageSource(jsonTranslation, origName)}`;
        }

        return data;
    }
}
