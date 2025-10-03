import { Parser } from '../Parser';
import { Quality } from '../../schema/QualitiesSchema';
import { CompendiumKey } from '../../importer/Constants';
import { ImportHelper as IH } from '../../helper/ImportHelper';

export class QualityParser extends Parser<'quality'> {
    protected readonly parseType = 'quality';

    protected override getSystem(jsonData: Quality) {
        const system = this.getBaseSystem();

        system.type = jsonData.category._TEXT === 'Positive' ? 'positive' : 'negative';
        system.karma = Number(jsonData.karma._TEXT) || 0;

        return system;
    }

    protected override async getFolder(jsonData: Quality, compendiumKey: CompendiumKey): Promise<Folder> {
        const isMetagenic = jsonData.metagenic?._TEXT === 'True';
        let rootFolder = game.i18n.localize('SR5.ItemTypes.Quality');
        if (isMetagenic)
            rootFolder += ' (Metagenic)';

        const folderName = IH.getTranslatedCategory('qualities', jsonData.category._TEXT);
        return IH.getFolder(compendiumKey, rootFolder, folderName);
    }
}
