import { SpellParserBase } from './SpellParserBase';
import { ImportHelper } from '../../helper/ImportHelper';
import SpellItemData = Shadowrun.SpellItemData;

export class ManipulationSpellParser extends SpellParserBase {
    override async Parse(jsonData: object, item: SpellItemData, jsonTranslation?: object): Promise<SpellItemData> {
        item = await super.Parse(jsonData, item, jsonTranslation);

        // A few spells have a missing descriptor instead of an empty string.
        // The field is <descriptor /> rather than <descriptor></descriptor>
        // which gets imported as undefined rather than empty string (sigh)
        // Rather than refactor our ImportHelper we'll handle it in here.
        // Sometimes the field misses altogether.
        let descriptor = ImportHelper.StringValue(jsonData, 'descriptor', '');
        if (descriptor === undefined) {
            descriptor = '';
        }

        item.system.manipulation.environmental = descriptor.includes('Environmental');
        // Generally no resistance roll.

        item.system.manipulation.mental = descriptor.includes('Mental');
        if (item.system.manipulation.mental) {
            item.system.action.opposed.type = 'custom';
            item.system.action.opposed.attribute = 'logic';
            item.system.action.opposed.attribute2 = 'willpower';
        }

        item.system.manipulation.physical = descriptor.includes('Physical');
        if (item.system.manipulation.physical) {
            item.system.action.opposed.type = 'custom';
            item.system.action.opposed.attribute = 'body';
            item.system.action.opposed.attribute2 = 'strength';
        }
        item.system.manipulation.damaging = descriptor.includes('Damaging');
        if (item.system.manipulation.damaging) {
            item.system.action.opposed.type = 'soak';
        }

        return item;
    }
}
