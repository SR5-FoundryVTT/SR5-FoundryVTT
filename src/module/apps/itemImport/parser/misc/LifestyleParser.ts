import { Parser } from '../Parser';
import { SR5 } from '../../../../config';
import { Lifestyle } from '../../schema/LifestylesSchema';
import { CompendiumKey } from '../../importer/Constants';
import { ImportHelper as IH } from '../../helper/ImportHelper';

export class LifestyleParser extends Parser<'lifestyle'> {
    protected readonly parseType = 'lifestyle';

    protected override getSystem(jsonData: Lifestyle) {
        const system = this.getBaseSystem();

        const type = jsonData.name._TEXT.toLowerCase();
        system.type = type in SR5.lifestyleTypes ? type as keyof typeof SR5.lifestyleTypes : 'other';
        system.cost = Number(jsonData.cost._TEXT) || 0;

        return system;
    }

    protected override async getFolder(jsonData: Lifestyle, compendiumKey: CompendiumKey): Promise<Folder> {
        return IH.getFolder(compendiumKey, game.i18n.localize('TYPES.Item.lifestyle'));
    }
}
