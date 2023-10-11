import { DataImporter } from './DataImporter';
import { ImportHelper } from '../helper/ImportHelper';
import { ArmorParserBase } from '../parser/armor/ArmorParserBase';
import { Helpers } from "../../helpers";
import { SR5 } from "../../config";

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

        let jsonArmori18n = ImportHelper.ExtractDataFileTranslation(DataImporter.jsoni18n, this.files[0]);
        this.categoryTranslations = ImportHelper.ExtractCategoriesTranslation(jsonArmori18n);
        this.armorTranslations = ImportHelper.ExtractItemTranslation(jsonArmori18n, 'armors', 'armor');
    }

    async Parse(jsonObject: object, setIcons: boolean): Promise<Item> {
        const folders = await ImportHelper.MakeCategoryFolders(jsonObject, 'Armor', this.categoryTranslations);
        const parser = new ArmorParserBase();
        let datas: Shadowrun.ArmorItemData[] = [];
        let jsonDatas = jsonObject['armors']['armor'];
        this.iconList = await this.getIconFiles();
        const parserType = 'armor';

        for (let i = 0; i < jsonDatas.length; i++) {
            let jsonData = jsonDatas[i];

            // Check to ensure the data entry is supported and the correct category
            if (DataImporter.unsupportedEntry(jsonData)) {
                continue;
            }

            // Create the item
            let item = parser.Parse(jsonData, this.GetDefaultData({type: parserType}));
            const category = ImportHelper.StringValue(jsonData, 'category').toLowerCase();
            // @ts-ignore TODO: Foundry Where is my foundry base data?
            item.folder = folders[category].id;

            // Import Flags
            item.system.importFlags = this.genImportFlags(item.name, item.type);

            let subType = this.formatAsSlug(category);
            if (Object.keys(SR5.itemSubTypeIconOverrides[parserType]).includes(subType)) {
                item.system.importFlags.subType = subType;
            }

            // Default icon
            if (setIcons) {item.img = await this.iconAssign(item.system.importFlags, item.system, this.iconList)};

            // Translate the name
            item.name = ImportHelper.MapNameToTranslation(this.armorTranslations, item.name);

            // Add relevant action tests
            Helpers.injectActionTestsIntoChangeData(item.type, item, item);

            datas.push(item);
        }

        // @ts-ignore
        return await Item.create(datas) as Item;
    }
}
