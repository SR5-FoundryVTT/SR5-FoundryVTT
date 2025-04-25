import { DataImporter } from './DataImporter';
import { ImportHelper as IH } from '../helper/ImportHelper';
import { SpriteParser } from '../parser/sprite/SpriteParser';
import { Constants } from './Constants';
import { SR5Actor } from '../../../actor/SR5Actor';
import { MetatypeSchema } from "../schema/MetatypeSchema";

export class SpriteImporter extends DataImporter<Shadowrun.SpriteActorData, Shadowrun.SpriteData> {
    public files = ['critters.xml'];

    CanParse(jsonObject: object): boolean {
        return jsonObject.hasOwnProperty('metatypes') && jsonObject['metatypes'].hasOwnProperty('metatype');
    }

    ExtractTranslation() {
        if (!DataImporter.jsoni18n) {
            return;
        }

        const jsonCritteri18n = IH.ExtractDataFileTranslation(DataImporter.jsoni18n, this.files[0]);
        this.categoryTranslations = IH.ExtractCategoriesTranslation(jsonCritteri18n);
        this.itemTranslations = IH.ExtractItemTranslation(jsonCritteri18n, 'metatypes', 'metatype');
    }

    async Parse(chummerData: MetatypeSchema, setIcons: boolean): Promise<StoredDocument<SR5Actor>[]> {
        const actors: Shadowrun.SpriteActorData[] = [];
        const jsonDatas = chummerData.metatypes.metatype;
        this.iconList = await this.getIconFiles();
        const parserType = 'sprite';
        const parser = new SpriteParser();

        const folder = await IH.GetFolderAtPath("Actor", `${Constants.ROOT_IMPORT_FOLDER_NAME}/Sprites`, true);

        for (const jsonData of jsonDatas) {
            // Check to ensure the data entry is supported and the correct category
            if (DataImporter.unsupportedEntry(jsonData) || IH.StringValue(jsonData, 'category') !== 'Sprites') {
                continue;
            }

            const actor = parser.Parse(
                jsonData,
                this.GetDefaultData({ type: parserType, entityType: 'Actor' }),
                this.itemTranslations,
            );

            //@ts-expect-error TODO: Foundry Where is my foundry base data?
            actor.folder = folder;

            // actor.system.importFlags = this.genImportFlags(actor.name, actor.type, this.formatAsSlug(category));
            // if (setIcons) {actor.img = await this.iconAssign(actor.system.importFlags, actor.system, this.iconList)};

            actor.name = IH.MapNameToTranslation(this.itemTranslations, actor.name);

            actors.push(actor);
        }

        // @ts-expect-error // TODO: TYPE: Remove this.
        return await Actor.create(actors);
    }
}
