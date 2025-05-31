import { Parser } from '../Parser';
import { Power } from '../../schema/CritterpowersSchema';
import { ImportHelper as IH } from '../../helper/ImportHelper';
import { TranslationHelper as TH } from '../../helper/TranslationHelper';
import CritterPowerCategory = Shadowrun.CritterPowerCategory;
import CritterPowerItemData = Shadowrun.CritterPowerItemData;

export class CritterPowerParser extends Parser<CritterPowerItemData> {
    protected override parseType: string = 'critter_power';

    protected override getSystem(jsonData: Power): CritterPowerItemData['system'] {
        const system = this.getBaseSystem('Item');

        const category = jsonData.category._TEXT.toLowerCase();
        system.category = (category.includes("infected") ? "infected" : category) as CritterPowerCategory;

        system.duration = jsonData.duration ? jsonData.duration._TEXT.toLowerCase() : "";

        const range = jsonData.range ? jsonData.range._TEXT : "";
        system.range = CritterPowerParser.rangeMap[range] ?? 'special';

        const type = jsonData.type ? jsonData.type._TEXT : "";
        system.powerType = CritterPowerParser.typeMap[type] ?? "";

        system.rating = 1;

        return system;
    }

    protected override async getFolder(jsonData: Power): Promise<Folder> {
        const rootFolder = "Critter Powers";
        const category = TH.getTranslation(jsonData.category._TEXT, { type: 'category' });

        return IH.getFolder('Trait', rootFolder, category);
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
