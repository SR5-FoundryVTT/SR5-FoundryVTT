import { Parser, SystemType } from '../Parser';
import { Spell } from '../../schema/SpellsSchema';
import { CompendiumKey } from '../../importer/Constants';
import { ImportHelper as IH } from '../../helper/ImportHelper';

export class SpellParserBase extends Parser<'spell'> {
    protected readonly parseType = 'spell';

    protected override getSystem(jsonData: Spell) {
        const system = this.getBaseSystem();

        system.action.type = 'varies';
        system.action.attribute = 'magic';
        system.action.skill = 'spellcasting';

        system.category = jsonData.category._TEXT.toLowerCase() as SystemType<'spell'>['category'];

        // Remove trailing 's' from category if it exists
        if (system.category.endsWith('s'))
            system.category = system.category.slice(0, -1) as SystemType<'spell'>['category'];

        const damage = jsonData.damage._TEXT;
        if (damage === 'P') {
            system.action.damage.type.base = 'physical';
            system.action.damage.type.value = 'physical';
        } else if (damage === 'S') {
            system.action.damage.type.base = 'stun';
            system.action.damage.type.value = 'stun';
        }

        const duration = jsonData.duration._TEXT;
        if (duration === 'I')
            system.duration = 'instant';
        else if (duration === 'S')
            system.duration = 'sustained';
        else if (duration === 'P')
            system.duration = 'permanent';

        const drain = jsonData.dv._TEXT;
        if (drain.includes('+') || drain.includes('-'))
            system.drain = parseInt(drain.substring(1, drain.length));

        const range = jsonData.range._TEXT;
        if (range === 'T')
            system.range = 'touch';
        else if (range === 'LOS')
            system.range = 'los';
        else if (range === 'LOS (A)')
            system.range = 'los_a';

        const type = jsonData.type._TEXT;
        if (type === 'P')
            system.type = 'physical';
        else if (type === 'M')
            system.type = 'mana';

        return system;
    }

    protected override async getFolder(jsonData: Spell, compendiumKey: CompendiumKey): Promise<Folder> {
        const folderName = IH.getTranslatedCategory('spells', jsonData.category._TEXT);
        return IH.getFolder(compendiumKey, folderName);
    }
}
