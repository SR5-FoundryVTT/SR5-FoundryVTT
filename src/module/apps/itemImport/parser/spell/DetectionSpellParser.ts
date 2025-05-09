import { SpellParserBase } from './SpellParserBase';
import { ImportHelper } from '../../helper/ImportHelper';
import SpellItemData = Shadowrun.SpellItemData;
import { Spell } from '../../schema/SpellsSchema';

export class DetectionSpellParser extends SpellParserBase {
    protected override getSystem(jsonData: Spell): SpellItemData['system'] {
        const system = super.getSystem(jsonData);

        const descriptor = jsonData.descriptor ? jsonData.descriptor._TEXT : '';

        system.detection.passive = descriptor.includes('Passive');
        if (!system.detection.passive) {
            system.action.opposed.type = 'custom';
            system.action.opposed.attribute = 'willpower';
            system.action.opposed.attribute2 = 'logic';
        }

        system.detection.extended = descriptor.includes('Extended');

        if (descriptor.includes('Psychic'))
            system.detection.type = 'psychic';
        else if (descriptor.includes('Directional'))
            system.detection.type = 'directional';
        else if (descriptor.includes('Area'))
            system.detection.type = 'area';

        return system;
    }
}
