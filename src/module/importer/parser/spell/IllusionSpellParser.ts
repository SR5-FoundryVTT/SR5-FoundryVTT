import { SpellParserBase } from './SpellParserBase';
import { ImportHelper } from '../../helper/ImportHelper';
import SpellItemData = Shadowrun.SpellItemData;

export class IllusionSpellParser extends SpellParserBase {
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

        if (data.data.type === 'mana') {
            data.data.action.opposed.type = 'custom';
            data.data.action.opposed.attribute = 'logic';
            data.data.action.opposed.attribute2 = 'willpower';
        } else if (data.data.type === 'physical') {
            data.data.action.opposed.type = 'custom';
            data.data.action.opposed.attribute = 'intuition';
            data.data.action.opposed.attribute2 = 'logic';
        }

        return data;
    }
}
