import { SpellParserBase } from './SpellParserBase';
import { ImportHelper } from '../../helper/ImportHelper';
import SpellItemData = Shadowrun.SpellItemData;
import { Spell } from '../../schema/SpellsSchema';

export class IllusionSpellParser extends SpellParserBase {
    protected override getSystem(jsonData: Spell): SpellItemData['system'] {
        const system = super.getSystem(jsonData);

        if (system.type === 'mana') {
            system.action.opposed.type = 'custom';
            system.action.opposed.attribute = 'logic';
            system.action.opposed.attribute2 = 'willpower';
        } else if (system.type === 'physical') {
            system.action.opposed.type = 'custom';
            system.action.opposed.attribute = 'intuition';
            system.action.opposed.attribute2 = 'logic';
        }

        return system;
    }
}
