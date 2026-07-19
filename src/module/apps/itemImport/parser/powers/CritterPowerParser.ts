import { Parser } from '../Parser';
import { CompendiumKey } from '../../importer/Constants';
import { Power } from '../../schema/CritterpowersSchema';
import { ImportHelper as IH } from '../../helper/ImportHelper';
import { CritterPowerCategories } from 'src/module/types/item/CritterPower';
import { WeaponParserBase } from '../weapon/WeaponParserBase';

const weaponParser = new WeaponParserBase();

export class CritterPowerParser extends Parser<'critter_power'> {
    protected readonly parseType = 'critter_power';

    protected override getSystem(jsonData: Power) {
        const system = this.getBaseSystem();

        let category = jsonData.category._TEXT.toLowerCase();
        category = (category.includes("infected") ? "infected" : category);
        system.category = CritterPowerCategories.includes(category as any)
            ? (category as typeof system.category)
            : "";

        system.duration = jsonData.duration ? jsonData.duration._TEXT.toLowerCase() as any : "";

        const range = jsonData.range ? jsonData.range._TEXT : "";
        system.range = CritterPowerParser.rangeMap[range] as any ?? 'special';

        const type = jsonData.type ? jsonData.type._TEXT : "";
        system.powerType = CritterPowerParser.typeMap[type] as any ?? "";

        system.rating = 1;

        const naturalWeapon = jsonData.bonus?.naturalweapon;
        if (naturalWeapon) {
            system.action.type = 'varies';
            system.action.attribute = 'agility';
            system.action.skill = naturalWeapon.useskill._TEXT.replace(/[\s-]/g, '_').toLowerCase();
            system.action.damage = weaponParser.parseDamageData(naturalWeapon.damage._TEXT, naturalWeapon.ap._TEXT);

            if (naturalWeapon.accuracy._TEXT.includes('Physical'))
                system.action.limit.attribute = 'physical';
        }

        return system;
    }

    protected override async getFolder(jsonData: Power, compendiumKey: CompendiumKey): Promise<Folder> {
        const rootFolder = "Critter Powers";
        const category = IH.getTranslatedCategory('critterpowers', jsonData.category._TEXT);

        return IH.getFolder(compendiumKey, rootFolder, category);
    }

    protected static readonly rangeMap = {
        'T': 'touch',
        'LOS': 'los',
        'LOS (A)': 'los_a',
        'Self': 'self',
    } as const;

    protected static readonly typeMap = {
        'P': 'physical',
        'M': 'mana',
    } as const;
}
