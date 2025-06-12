import { Spell } from '../../schema/SpellsSchema';
import { SpellParserBase } from './SpellParserBase';

export class ManipulationSpellParser extends SpellParserBase {
    protected override getSystem(jsonData: Spell) {
        const system = super.getSystem(jsonData);

        const descriptor = jsonData.descriptor ? jsonData.descriptor._TEXT : '';

        // Generally no resistance roll.
        system.manipulation.environmental = descriptor.includes('Environmental');

        system.manipulation.mental = descriptor.includes('Mental');
        if (system.manipulation.mental) {
            system.action.opposed.type = 'custom';
            system.action.opposed.attribute = 'logic';
            system.action.opposed.attribute2 = 'willpower';
        }

        system.manipulation.physical = descriptor.includes('Physical');
        if (system.manipulation.physical) {
            system.action.opposed.type = 'custom';
            system.action.opposed.attribute = 'body';
            system.action.opposed.attribute2 = 'strength';
        }

        system.manipulation.damaging = descriptor.includes('Damaging');
        if (system.manipulation.damaging)
            system.action.opposed.type = 'soak';

        return system;
    }
}
