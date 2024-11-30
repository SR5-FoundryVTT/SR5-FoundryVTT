import { ImportHelper } from '../../helper/ImportHelper';
import CritterPowerCategory = Shadowrun.CritterPowerCategory;
import { ItemParserBase } from '../item/ItemParserBase';
import CritterPowerItemData = Shadowrun.CritterPowerItemData;

export class CritterPowerParserBase extends ItemParserBase<CritterPowerItemData> {
    public override Parse(jsonData: object, item: CritterPowerItemData, jsonTranslation?: object): CritterPowerItemData {
        item.name = ImportHelper.StringValue(jsonData, 'name');

        item.system.description.source = `${ImportHelper.StringValue(jsonData, 'source')} ${ImportHelper.StringValue(jsonData, 'page')}`;

        const category = ImportHelper.StringValue(jsonData, 'category').toLowerCase();
        item.system.category = (category.includes("infected") ? "infected" : category) as CritterPowerCategory;

        let duration = ImportHelper.StringValue(jsonData, 'duration');
        if (duration === 'Always') {
            item.system.duration = 'always';
        } else if (duration === 'Instant') {
            item.system.duration = 'instant';
        } else if (duration === 'Sustained') {
            item.system.duration = 'sustained';
        } else if (duration === 'Permanent') {
            item.system.duration = 'permanent';
        } else {
              item.system.duration = 'special';
        }

        let range = ImportHelper.StringValue(jsonData, 'range');
        if (range === 'T') {
            item.system.range = 'touch';
        } else if (range === 'LOS') {
            item.system.range = 'los';
        } else if (range === 'LOS (A)') {
            item.system.range = 'los_a';
        } else if (range === 'Self') {
           item.system.range = 'self';
        } else {
          item.system.range = 'special';
        }

        let type = ImportHelper.StringValue(jsonData, 'type');
        if (type === 'P') {
            item.system.powerType = 'physical';
        } else if (type === 'M') {
            item.system.powerType = 'mana';
        }

        if (jsonTranslation) {
            const origName = ImportHelper.StringValue(jsonData, 'name');
            item.name = ImportHelper.MapNameToTranslation(jsonTranslation, origName);
            item.system.description.source = `${ImportHelper.StringValue(jsonData, 'source')} ${ImportHelper.MapNameToPageSource(jsonTranslation, origName)}`;
        }

        return item;
    }
}
