import { SpellParserBase } from './SpellParserBase';
import { ImportHelper } from '../../helper/ImportHelper';
import SpellItemData = Shadowrun.SpellItemData;

export class DetectionSpellImporter extends SpellParserBase {
    override Parse(jsonData: object, item: SpellItemData, jsonTranslation?: object): SpellItemData {
        item = super.Parse(jsonData, item, jsonTranslation);

        let descriptor = ImportHelper.StringValue(jsonData, 'descriptor');
        // A few spells have a missing descriptor instead of an empty string.
        // The field is <descriptor /> rather than <descriptor></descriptor>
        // which gets imported as undefined rather than empty string (sigh)
        // Rather than refactor our ImportHelper we'll handle it in here.
        if (descriptor === undefined) {
            descriptor = '';
        }

        item.system.detection.passive = descriptor.includes('Passive');
        if (!item.system.detection.passive) {
            item.system.action.opposed.type = 'custom';
            item.system.action.opposed.attribute = 'willpower';
            item.system.action.opposed.attribute2 = 'logic';
        }

        item.system.detection.extended = descriptor.includes('Extended');

        if (descriptor.includes('Psychic')) {
            item.system.detection.type = 'psychic';
        } else if (descriptor.includes('Directional')) {
            item.system.detection.type = 'directional';
        } else if (descriptor.includes('Area')) {
            item.system.detection.type = 'area';
        }

        return item;
    }
}
