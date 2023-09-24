import { DataImporter } from './DataImporter';
import { ImportHelper } from '../helper/ImportHelper';
import { ArmorParserBase } from '../parser/armor/ArmorParserBase';
import ArmorItemData = Shadowrun.ArmorItemData;
import {Helpers} from "../../helpers";
import { SR5 } from "../../config";

export class ArmorImporter extends DataImporter<ArmorItemData, Shadowrun.ArmorData> {
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

    async Parse(jsonObject: object): Promise<Item> {
        const folders = await ImportHelper.MakeCategoryFolders(jsonObject, 'Armor', this.categoryTranslations);
        const parser = new ArmorParserBase();
        let datas: ArmorItemData[] = [];
        let jsonDatas = jsonObject['armors']['armor'];

        for (let i = 0; i < jsonDatas.length; i++) {
            let jsonData = jsonDatas[i];

            // Check to ensure the data entry is supported and the correct category
            if (DataImporter.unsupportedEntry(jsonData)) {
                continue;
            }

            // Create the item
            let item = parser.Parse(jsonData, this.GetDefaultData({type: 'armor'}));
            const category = ImportHelper.StringValue(jsonData, 'category').toLowerCase();
            // @ts-ignore TODO: Foundry Where is my foundry base data?
            item.folder = folders[category].id;

            // Import Flags
            item.system.importFlags.name = foundry.utils.deepClone(item.name); // original english name for matching to icons
            item.system.importFlags.type = item.type;
            item.system.importFlags.subType = '';
            item.system.importFlags.isFreshImport = true;

            let subType = category.trim().split(' ').join('-');
            if (SR5.itemSubTypes.armor.includes(subType)) {
                item.system.importFlags.subType = subType;
            }

            // Default icon
            item.img = this.iconAssign(item.system.importFlags, item.system);

            // Translate the name
            item.name = ImportHelper.MapNameToTranslation(this.armorTranslations, item.name);

            Helpers.injectActionTestsIntoChangeData(item.type, item, item);

            datas.push(item);
        }

        // @ts-ignore
        return await Item.create(datas) as Item;
    }
}
