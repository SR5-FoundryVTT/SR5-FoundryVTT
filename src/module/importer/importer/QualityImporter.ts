import { DataImporter } from './DataImporter';
import { ImportHelper } from '../helper/ImportHelper';
import { QualityParserBase } from '../parser/quality/QualityParserBase';
import QualityItemData = Shadowrun.QualityItemData;
import {Helpers} from "../../helpers";
import { SR5 } from "../../config";

export class QualityImporter extends DataImporter<QualityItemData, Shadowrun.QualityData> {
    public override categoryTranslations: any;
    public override itemTranslations: any;
    public files = ['qualities.xml'];

    CanParse(jsonObject: object): boolean {
        return jsonObject.hasOwnProperty('qualities') && jsonObject['qualities'].hasOwnProperty('quality');
    }

    ExtractTranslation() {
        if (!DataImporter.jsoni18n) {
            return;
        }

        let jsonQualityi18n = ImportHelper.ExtractDataFileTranslation(DataImporter.jsoni18n, this.files[0]);
        this.categoryTranslations = ImportHelper.ExtractCategoriesTranslation(jsonQualityi18n);
        this.itemTranslations = ImportHelper.ExtractItemTranslation(jsonQualityi18n, 'qualities', 'quality');
    }

    async Parse(jsonObject: object): Promise<Item> {
        const jsonNameTranslations = {};
        const folders = await ImportHelper.MakeCategoryFolders(jsonObject, 'Qualities', this.categoryTranslations);

        const parser = new QualityParserBase();

        let items: QualityItemData[] = [];
        let jsonDatas = jsonObject['qualities']['quality'];
        for (let i = 0; i < jsonDatas.length; i++) {
            let jsonData = jsonDatas[i];

            // Check to ensure the data entry is supported and the correct category
            if (DataImporter.unsupportedEntry(jsonData)) {
                continue;
            }

            // Create the item
            let item = parser.Parse(jsonData, this.GetDefaultData({type: 'quality'}), this.itemTranslations);
            let category = ImportHelper.StringValue(jsonData, 'category').toLowerCase();
            //@ts-ignore TODO: Foundry Where is my foundry base data?
            item.folder = folders[category].id;

            // Import Flags
            item.system.importFlags.name = foundry.utils.deepClone(item.name); // original english name for matching to icons
            item.system.importFlags.type = item.type;
            item.system.importFlags.subType = '';
            item.system.importFlags.isFreshImport = true;

            let subType = category.trim().split(' ').join('-');
            if (SR5.itemSubTypes.quality.includes(subType)) {
                item.system.importFlags.subType = subType;
            }

            // Default icon
            item.img = await this.iconAssign(item.system.importFlags, item.system);

            // Translate the name
            item.name = ImportHelper.MapNameToTranslation(this.itemTranslations, item.name);

            Helpers.injectActionTestsIntoChangeData(item.type, item, item);

            items.push(item);
        }

        // @ts-ignore // TODO: TYPE: Remove this.
        return await Item.create(items);
    }
}
