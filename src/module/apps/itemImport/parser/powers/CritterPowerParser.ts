import { Parser } from '../Parser';
import { CompendiumKey } from '../../importer/Constants';
import { Power } from '../../schema/CritterpowersSchema';
import { ImportHelper as IH } from '../../helper/ImportHelper';
import { TranslationHelper as TH } from '../../helper/TranslationHelper';
import { CritterPowerCategories } from 'src/module/types/item/CritterPower';

export class CritterPowerParser extends Parser<'critter_power'> {
    protected readonly parseType = 'critter_power';

    protected override getSystem(jsonData: Power) {
        const system = this.getBaseSystem();

        let category = jsonData.category._TEXT.toLowerCase();
        category = (category.includes("infected") ? "infected" : category);
        system.category = CritterPowerCategories.includes(category as any)
            ? (category as typeof CritterPowerCategories[number])
            : "";

        system.duration = jsonData.duration ? jsonData.duration._TEXT.toLowerCase() : "";

        const range = jsonData.range ? jsonData.range._TEXT : "";
        system.range = CritterPowerParser.rangeMap[range] ?? 'special';

        const type = jsonData.type ? jsonData.type._TEXT : "";
        system.powerType = CritterPowerParser.typeMap[type] ?? "";

        system.rating = 1;

        return system;
    }

    protected override async getFolder(jsonData: Power, compendiumKey: CompendiumKey): Promise<Folder> {
        const rootFolder = "Critter Powers";
        const category = TH.getTranslation(jsonData.category._TEXT, { type: 'category' });

        return IH.getFolder(compendiumKey, rootFolder, category);
    }

    protected static readonly rangeMap: Record<string, string> = {
        'T': 'touch',
        'LOS': 'los',
        'LOS (A)': 'los_a',
        'Self': 'self',
    } as const;

    protected static readonly typeMap: Record<string, string> = {
        'P': 'physical',
        'M': 'mana',
    } as const;
}
