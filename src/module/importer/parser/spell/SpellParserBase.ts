import { ImportHelper } from '../../helper/ImportHelper';
import SpellCateogry = Shadowrun.SpellCateogry;
import { ItemParserBase } from '../item/ItemParserBase';
import SpellItemData = Shadowrun.SpellItemData;

export class SpellParserBase extends ItemParserBase<SpellItemData> {
    public Parse(jsonData: object, item: SpellItemData, jsonTranslation?: object): SpellItemData {
        item.name = ImportHelper.StringValue(jsonData, 'name');

        item.system.description.source = `${ImportHelper.StringValue(jsonData, 'source')} ${ImportHelper.StringValue(jsonData, 'page')}`;
        item.system.category = ImportHelper.StringValue(jsonData, 'category').toLowerCase() as SpellCateogry;

        let damage = ImportHelper.StringValue(jsonData, 'damage');
        if (damage === 'P') {
            item.system.action.damage.type.base = 'physical';
            item.system.action.damage.type.value = 'physical';
        } else if (damage === 'S') {
            item.system.action.damage.type.base = 'stun';
            item.system.action.damage.type.value = 'stun';
        }

        let duration = ImportHelper.StringValue(jsonData, 'duration');
        if (duration === 'I') {
            item.system.duration = 'instant';
        } else if (duration === 'S') {
            item.system.duration = 'sustained';
        } else if (duration === 'P') {
            item.system.duration = 'permanent';
        }

        let drain = ImportHelper.StringValue(jsonData, 'dv');
        if (drain.includes('+') || drain.includes('-')) {
            item.system.drain = parseInt(drain.substring(1, drain.length));
        }

        let range = ImportHelper.StringValue(jsonData, 'range');
        if (range === 'T') {
            item.system.range = 'touch';
        } else if (range === 'LOS') {
            item.system.range = 'los';
        } else if (range === 'LOS (A)') {
            item.system.range = 'los_a';
        }

        let type = ImportHelper.StringValue(jsonData, 'type');
        if (type === 'P') {
            item.system.type = 'physical';
        } else if (type === 'M') {
            item.system.type = 'mana';
        }

        if (jsonTranslation) {
            const origName = ImportHelper.StringValue(jsonData, 'name');
            item.name = ImportHelper.MapNameToTranslation(jsonTranslation, origName);
            item.system.description.source = `${ImportHelper.StringValue(jsonData, 'source')} ${ImportHelper.MapNameToPageSource(jsonTranslation, origName)}`;
        }

        return item;
    }
}
