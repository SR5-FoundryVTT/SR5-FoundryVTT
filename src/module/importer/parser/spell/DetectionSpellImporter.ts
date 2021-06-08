import { SpellParserBase } from './SpellParserBase';
import { ImportHelper } from '../../helper/ImportHelper';
import SpellItemData = Shadowrun.SpellItemData;

export class DetectionSpellImporter extends SpellParserBase {
    Parse(jsonData: object, data: SpellItemData, jsonTranslation?: object): SpellItemData {
        data = super.Parse(jsonData, data, jsonTranslation);

        let descriptor = ImportHelper.StringValue(jsonData, 'descriptor');
        // A few spells have a missing descriptor instead of an empty string.
        // The field is <descriptor /> rather than <descriptor></descriptor>
        // which gets imported as undefined rather than empty string (sigh)
        // Rather than refactor our ImportHelper we'll handle it in here.
        if (descriptor === undefined) {
            descriptor = '';
        }

        data.data.detection.passive = descriptor.includes('Passive');
        if (!data.data.detection.passive) {
            data.data.action.opposed.type = 'custom';
            data.data.action.opposed.attribute = 'willpower';
            data.data.action.opposed.attribute2 = 'logic';
        }

        data.data.detection.extended = descriptor.includes('Extended');

        if (descriptor.includes('Psychic')) {
            data.data.detection.type = 'psychic';
        } else if (descriptor.includes('Directional')) {
            data.data.detection.type = 'directional';
        } else if (descriptor.includes('Area')) {
            data.data.detection.type = 'area';
        }

        return data;
    }
}
