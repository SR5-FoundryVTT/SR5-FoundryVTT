import { Parser } from '../Parser';
import { Mod } from '../../schema/ArmorSchema';
import { Gear } from '../../schema/GearSchema';
import { CompendiumKey } from '../../importer/Constants';
import { ImportHelper as IH } from '../../helper/ImportHelper';

export class ArmorModParser extends Parser<'modification'> {
    protected readonly parseType = 'modification';

    protected override getSystem(jsonData: Mod | Gear) {
        const system = this.getBaseSystem();
        system.type = 'armor';

        if ('armor' in jsonData)
            system.mod_armor.value = Number(jsonData.armor?._TEXT) || 0;

        if (jsonData.armorcapacity)
            system.slots = Number(jsonData.armorcapacity._TEXT.replace(/\[|\]/g, '')) || 0;

        if (jsonData.name._TEXT.includes("Hardened")) {
            system.mod_armor.is_hardened = true;
        }

        return system;
    }

    protected override async getFolder(jsonData: Mod | Gear, compendiumKey: CompendiumKey): Promise<Folder> {
        const category = jsonData.category._TEXT;
        const rootFolder = "Armor-Mods";
        const folderName = IH.getTranslatedCategory('armor', category);

        return IH.getFolder(compendiumKey, rootFolder, folderName);
    }
}
