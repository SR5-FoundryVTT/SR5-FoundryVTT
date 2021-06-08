import { SpellParserBase } from './SpellParserBase';
import { ImportHelper } from '../../helper/ImportHelper';
import SpellItemData = Shadowrun.SpellItemData;

export class ManipulationSpellParser extends SpellParserBase {
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

        data.data.manipulation.environmental = descriptor.includes('Environmental');
        // Generally no resistance roll.

        data.data.manipulation.mental = descriptor.includes('Mental');
        if (data.data.manipulation.mental) {
            data.data.action.opposed.type = 'custom';
            data.data.action.opposed.attribute = 'logic';
            data.data.action.opposed.attribute2 = 'willpower';
        }

        data.data.manipulation.physical = descriptor.includes('Physical');
        if (data.data.manipulation.physical) {
            data.data.action.opposed.type = 'custom';
            data.data.action.opposed.attribute = 'body';
            data.data.action.opposed.attribute2 = 'strength';
        }
        data.data.manipulation.damaging = descriptor.includes('Damaging');
        if (data.data.manipulation.damaging) {
            data.data.action.opposed.type = 'soak';
        }

        return data;
    }
}
