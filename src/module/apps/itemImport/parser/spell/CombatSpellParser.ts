import { SpellParserBase } from './SpellParserBase';
import { ImportHelper } from '../../helper/ImportHelper';
import SpellItemData = Shadowrun.SpellItemData;
import { Spell } from '../../schema/SpellsSchema';

export class CombatSpellParser extends SpellParserBase {
    protected override getSystem(jsonData: Spell): SpellItemData['system'] {
        const system = super.getSystem(jsonData);

        const descriptor = jsonData.descriptor ? jsonData.descriptor._TEXT : '';
        system.combat.type = descriptor.includes('Indirect') ? 'indirect' : 'direct';

        return system;
    }
}
