import { Spell } from '../../schema/SpellsSchema';
import { SpellParserBase } from './SpellParserBase';

export class CombatSpellParser extends SpellParserBase {
    protected override getSystem(jsonData: Spell): Item.SystemOfType<'spell'> {
        const system = super.getSystem(jsonData);

        const descriptor = jsonData.descriptor ? jsonData.descriptor._TEXT : '';
        system.combat.type = descriptor.includes('Indirect') ? 'indirect' : 'direct';

        return system;
    }
}
