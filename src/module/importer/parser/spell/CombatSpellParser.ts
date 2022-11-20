import { SpellParserBase } from './SpellParserBase';
import { ImportHelper } from '../../helper/ImportHelper';
import SpellItemData = Shadowrun.SpellItemData;

export class CombatSpellParser extends SpellParserBase {
    Parse(jsonData: object, item: SpellItemData, jsonTranslation?: object): SpellItemData {
        item = super.Parse(jsonData, item, jsonTranslation);

        let descriptor = ImportHelper.StringValue(jsonData, 'descriptor');
        // A few spells have a missing descriptor instead of an empty string.
        // The field is <descriptor /> rather than <descriptor></descriptor>
        // which gets imported as undefined rather than empty string (sigh)
        // Rather than refactor our ImportHelper we'll handle it in here.
        if (descriptor === undefined) {
            descriptor = '';
        }

        // Lower case is needed for the system.
        item.system.combat.type = descriptor.includes('Indirect') ? 'indirect' : 'direct';

        return item;
    }
}
