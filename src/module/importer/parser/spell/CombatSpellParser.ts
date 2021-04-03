import { SpellParserBase } from './SpellParserBase';
import { ImportHelper } from '../../helper/ImportHelper';

export class CombatSpellParser extends SpellParserBase {
    Parse(jsonData: object, data: Shadowrun.Spell, jsonTranslation?: object): Shadowrun.Spell {
        data = super.Parse(jsonData, data, jsonTranslation);

        let descriptor = ImportHelper.StringValue(jsonData, 'descriptor');
        // A few spells have a missing descriptor instead of an empty string.
        // The field is <descriptor /> rather than <descriptor></descriptor>
        // which gets imported as undefined rather than empty string (sigh)
        // Rather than refactor our ImportHelper we'll handle it in here.
        if (descriptor === undefined) {
            descriptor = '';
        }

        data.data.combat.type = descriptor.includes('Indirect') ? 'indirect' : 'direct';
        if (data.data.combat.type === 'direct') {
            data.data.action.opposed.type = 'soak';
            switch (data.data.type) {
                case 'physical':
                    data.data.action.opposed.attribute = 'body';
                    break;
                case 'mana':
                    data.data.action.opposed.attribute = 'willpower';
                    break;
                default:
                    break;
            }
        } else if (data.data.combat.type === 'indirect') {
            data.data.action.opposed.type = 'defense';
        }

        return data;
    }
}
