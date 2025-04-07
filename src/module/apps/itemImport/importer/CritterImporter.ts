import { DataImporter } from './DataImporter';
import { ImportHelper } from '../helper/ImportHelper';
import { CritterParser } from '../parser/critter/CritterParser';
import { Constants } from './Constants';
import { SR5Actor } from '../../../actor/SR5Actor';

export class CritterImporter extends DataImporter<Shadowrun.CharacterActorData, Shadowrun.CharacterData> {
    public files = ['critters.xml'];

    CanParse(jsonObject: object): boolean {
        return jsonObject.hasOwnProperty('metatypes') && jsonObject['metatypes'].hasOwnProperty('metatype');
    }

    ExtractTranslation() {
        if (!DataImporter.jsoni18n) {
            return;
        }

        const jsonVehiclei18n = ImportHelper.ExtractDataFileTranslation(DataImporter.jsoni18n, this.files[0]);
        this.categoryTranslations = ImportHelper.ExtractCategoriesTranslation(jsonVehiclei18n);
        this.itemTranslations = ImportHelper.ExtractItemTranslation(jsonVehiclei18n, 'metatypes', 'metatype');
    }

    async Parse(chummerData: object, setIcons: boolean): Promise<StoredDocument<SR5Actor>[]> {
        const actors: Shadowrun.CharacterActorData[] = [];
        const jsonDatas = chummerData['metatypes']['metatype'];
        this.iconList = await this.getIconFiles();
        const parserType = 'character';
        const parser = new CritterParser();

        const emptyCategories = [
            'A.I.s',
            'Entropic Sprites',
            'Fey',
            'Ghosts and Haunts',
            'Harbingers',
            'Imps',
            'Primordial Spirits',
            '',
        ];

        chummerData['categories']['category'] = chummerData['categories']['category']
            .filter(({ _TEXT }) => !emptyCategories.includes(_TEXT));

        const folders = await ImportHelper.MakeCategoryFolders(
            'Actor',
            chummerData,
            'Critters',
            this.categoryTranslations,
        );

        for (let i = 0; i < jsonDatas.length; i++) {
        // for (let i = 0; i < 1; i++) {
            const jsonData = jsonDatas[i];

            // Check to ensure the data entry is supported and the correct category
            if (DataImporter.unsupportedEntry(jsonData)) {
                continue;
            }

            const actor = parser.Parse(
                jsonData,
                this.GetDefaultData({ type: parserType, entityType: 'Actor' }),
                this.itemTranslations,
            );
            const category = ImportHelper.StringValue(jsonData, 'category').toLowerCase();

            //@ts-expect-error TODO: Foundry Where is my foundry base data?
            actor.folder = folders[category]?.id;

            // actor.system.importFlags = this.genImportFlags(actor.name, actor.type, this.formatAsSlug(category));
            // if (setIcons) {actor.img = await this.iconAssign(actor.system.importFlags, actor.system, this.iconList)};

            actor.name = ImportHelper.MapNameToTranslation(this.itemTranslations, actor.name);

            actors.push(actor);
        }

        // @ts-expect-error // TODO: TYPE: Remove this.
        return await Actor.create(actors);
    }
}
