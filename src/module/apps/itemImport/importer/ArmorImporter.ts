import { DataImporter } from './DataImporter';
import { ImportHelper } from '../helper/ImportHelper';
import { ArmorParserBase } from '../parser/armor/ArmorParserBase';
import { UpdateActionFlow } from '../../../item/flows/UpdateActionFlow';

export class ArmorImporter extends DataImporter<Shadowrun.ArmorItemData, Shadowrun.ArmorData> {
    public armorTranslations: any;
    public override categoryTranslations: any;
    public files = ['armor.xml'];

    CanParse(jsonObject: object): boolean {
        return jsonObject.hasOwnProperty('armors') && jsonObject['armors'].hasOwnProperty('armor');
    }

    ExtractTranslation() {
        if (!DataImporter.jsoni18n) {
            return;
        }

        const jsonArmori18n = ImportHelper.ExtractDataFileTranslation(DataImporter.jsoni18n, this.files[0]);
        this.categoryTranslations = ImportHelper.ExtractCategoriesTranslation(jsonArmori18n);
        this.armorTranslations = ImportHelper.ExtractItemTranslation(jsonArmori18n, 'armors', 'armor');
    }

    async Parse(jsonObject: object, setIcons: boolean): Promise<Item> {
        const folders = await ImportHelper.MakeCategoryFolders("Item", jsonObject, 'Armor', this.categoryTranslations);
        const parser = new ArmorParserBase();
        const datas: Shadowrun.ArmorItemData[] = [];
        const jsonDatas = jsonObject['armors']['armor'];
        this.iconList = await this.getIconFiles();
        const parserType = 'armor';

        for (let i = 0; i < jsonDatas.length; i++) {
            const jsonData = jsonDatas[i];

            // Check to ensure the data entry is supported and the correct category
            if (DataImporter.unsupportedEntry(jsonData)) {
                continue;
            }

            // Create the item
            const item = parser.Parse(jsonData, this.GetDefaultData({type: parserType, entityType: "Item"}));
            const category = ImportHelper.StringValue(jsonData, 'category').toLowerCase();
            // @ts-expect-error TODO: Foundry Where is my foundry base data?
            item.folder = folders[category].id;

            // Import Flags
            item.system.importFlags = this.genImportFlags(item.name, item.type, this.formatAsSlug(category));

            // Default icon
            if (setIcons) {item.img = await this.iconAssign(item.system.importFlags, item.system, this.iconList)};

            // Translate the name
            item.name = ImportHelper.MapNameToTranslation(this.armorTranslations, item.name);

            // Add relevant action tests
            UpdateActionFlow.injectActionTestsIntoChangeData(item.type, item, item);

            datas.push(item);
        }

        // @ts-expect-error // TODO: foundry-vtt-types v10
        return await Item.create(datas) as Item;
    }
}
