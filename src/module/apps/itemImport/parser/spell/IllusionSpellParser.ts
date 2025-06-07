import { Spell } from '../../schema/SpellsSchema';
import { SpellParserBase } from './SpellParserBase';
import SpellItemData = Shadowrun.SpellItemData;

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
