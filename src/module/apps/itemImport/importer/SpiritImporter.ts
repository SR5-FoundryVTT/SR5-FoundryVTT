import { DataImporter } from './DataImporter';
import { ImportHelper as IH } from '../helper/ImportHelper';
import { SpiritParser } from '../parser/metatype/SpiritParser';
import { Constants } from './Constants';
import { SR5Actor } from '../../../actor/SR5Actor';
import { MetatypeSchema } from "../schema/MetatypeSchema";

export class SpiritImporter extends DataImporter<Shadowrun.SpiritActorData, Shadowrun.SpiritData> {
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

    private isSpirit(jsonData: object): Boolean {
        const attributeKeys = [
            "bodmin", "agimin", "reamin",
            "strmin", "chamin", "intmin",
            "logmin", "wilmin",
        ];
    
        for (const key of attributeKeys) {
            if (IH.StringValue(jsonData, key, "F").includes("F")) {
                return true;
            }
        }

        return false;
    }

    async Parse(chummerData: MetatypeSchema, setIcons: boolean): Promise<StoredDocument<SR5Actor>[]> {
        const actors: Shadowrun.SpiritActorData[] = [];

        const insectTypes = new Set<string>();

        const baseMetatypes = chummerData.metatypes.metatype;
        const metavariants = baseMetatypes.flatMap(metatype => {
            const parentName = metatype.name._TEXT;
            if (!metatype.metavariants) return [];

            const variants = IH.getArray(metatype.metavariants?.metavariant ?? []);

            for (const variant of variants) insectTypes.add(variant.name._TEXT);

            return variants.map(variant => ({
                ...variant,
                name: { _TEXT: `${parentName} (${variant.name._TEXT})` },
                category: { _TEXT: metatype.category?._TEXT ?? "" },
            }));
        });

        const jsonDatas = [...baseMetatypes, ...metavariants];

        this.iconList = await this.getIconFiles();
        const parserType = 'spirit';
        const parser = new SpiritParser();

        const CategoriesList = [
            'Extraplanar Travelers',
            'Insect Spirits',
            'Necro Spirits',
            'Ritual',
            'Shadow Spirits',
            'Shedim',
            'Spirits',
            'Toxic Spirits'
        ];

        const Categories = {
            categories: {
                category: chummerData['categories']['category'].filter(({ _TEXT }) => CategoriesList.includes(_TEXT))
            },
        };

        const folders = await IH.MakeCategoryFolders('Actor', Categories, 'Spirits', this.categoryTranslations);

        // Add insect type folders
        for (const insect of insectTypes) {
            const path = `${Constants.ROOT_IMPORT_FOLDER_NAME}/Spirits/Insect Spirits/${insect}`;
            folders[`insect spirits/${insect.toLowerCase()}`] = await IH.GetFolderAtPath("Actor", path, true);
        }

        for (const jsonData of jsonDatas) {
            // Check to ensure the data entry is supported and the correct category
            if (   !this.isSpirit(jsonData)
                || DataImporter.unsupportedEntry(jsonData)
                || IH.StringValue(jsonData, 'category') === 'Sprites') {
                continue;
            }

            const actor = parser.Parse(
                jsonData,
                this.GetDefaultData({ type: parserType, entityType: 'Actor' }),
                this.itemTranslations,
            );
            let category = IH.StringValue(jsonData, 'category').toLowerCase();

            // handle insect folders
            if (category === 'insect spirits' && jsonData.name._TEXT.includes("(")) {
                const match = jsonData.name._TEXT.match(/\(([^)]+)\)/);

                if (match)
                    category += `/${match[1].toLowerCase()}`;
            }

            //@ts-expect-error TODO: Foundry Where is my foundry base data?
            actor.folder = folders[category]?.id;

            // actor.system.importFlags = this.genImportFlags(actor.name, actor.type, this.formatAsSlug(category));
            // if (setIcons) {actor.img = await this.iconAssign(actor.system.importFlags, actor.system, this.iconList)};

            actor.name = IH.MapNameToTranslation(this.itemTranslations, actor.name);

            actors.push(actor);
        }

        // @ts-expect-error // TODO: TYPE: Remove this.
        return await Actor.create(actors);
    }
}
