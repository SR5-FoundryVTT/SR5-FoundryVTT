import { DataImporter } from './DataImporter';
import { ImportHelper } from '../helper/ImportHelper';
import { QualityParserBase } from '../parser/quality/QualityParserBase';
import { UpdateActionFlow } from '../../../item/flows/UpdateActionFlow';

export class QualityImporter extends DataImporter<Shadowrun.QualityItemData, Shadowrun.QualityData> {
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

        const jsonQualityi18n = ImportHelper.ExtractDataFileTranslation(DataImporter.jsoni18n, this.files[0]);
        this.categoryTranslations = ImportHelper.ExtractCategoriesTranslation(jsonQualityi18n);
        this.itemTranslations = ImportHelper.ExtractItemTranslation(jsonQualityi18n, 'qualities', 'quality');
    }

    async Parse(jsonObject: object, setIcons: boolean): Promise<Item> {
        const folders = await ImportHelper.MakeCategoryFolders("Item", jsonObject, 'Qualities', this.categoryTranslations);
        const parser = new QualityParserBase();
        const items: Shadowrun.QualityItemData[] = [];
        const jsonDatas = jsonObject['qualities']['quality'];
        this.iconList = await this.getIconFiles();
        const parserType = 'quality';

        for (let i = 0; i < jsonDatas.length; i++) {
            const jsonData = jsonDatas[i];

            // Check to ensure the data entry is supported and the correct category
            if (DataImporter.unsupportedEntry(jsonData)) {
                continue;
            }

            // Create the item
            const item = parser.Parse(jsonData, this.GetDefaultData({type: parserType, entityType: "Item"}), this.itemTranslations);
            const category = ImportHelper.StringValue(jsonData, 'category').toLowerCase();
            //@ts-expect-error TODO: Foundry Where is my foundry base data?
            item.folder = folders[category].id;

            // Import Flags
            item.system.importFlags = this.genImportFlags(item.name, item.type, this.formatAsSlug(category));

            // Default icon
            if (setIcons) {item.img = await this.iconAssign(item.system.importFlags, item.system, this.iconList)};

            // Translate the name
            item.name = ImportHelper.MapNameToTranslation(this.itemTranslations, item.name);

            // Add relevant action tests
            UpdateActionFlow.injectActionTestsIntoChangeData(item.type, item, item);

            items.push(item);
        }

        // @ts-expect-error // TODO: TYPE: Remove this.
        return await Item.create(items);
    }
}
