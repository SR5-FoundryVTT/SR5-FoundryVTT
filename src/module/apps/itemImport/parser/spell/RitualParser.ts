import { Parser } from '../Parser';
import { Spell } from '../../schema/SpellsSchema';
import { CompendiumKey } from '../../importer/Constants';
import { ImportHelper as IH } from '../../helper/ImportHelper';

export class RitualParser extends Parser<'ritual'> {
    protected readonly parseType = 'ritual';

    protected override getSystem(jsonData: Spell) {
        const system = this.getBaseSystem();

        system.action.attribute = 'magic';
        system.action.skill = 'ritual_spellcasting';

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
