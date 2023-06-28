import { DataImporter } from './DataImporter';
import { ImportHelper } from '../helper/ImportHelper';
import { ArmorParserBase } from '../parser/armor/ArmorParserBase';
import ArmorItemData = Shadowrun.ArmorItemData;
import {Helpers} from "../../helpers";

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
            if (DataImporter.unsupportedEntry(jsonData)) {
                continue;
            }

            let item = parser.Parse(jsonData, this.GetDefaultData({type: 'armor'}));
            const category = ImportHelper.StringValue(jsonData, 'category').toLowerCase();
            item.name = ImportHelper.MapNameToTranslation(this.armorTranslations, item.name);
            
            // @ts-ignore TODO: Foundry Where is my foundry base data?
            item.folder = folders[category].id;

            Helpers.injectActionTestsIntoChangeData(item.type, item, item);

            // TODO: Move this to a more general base class
            item.img = this.iconAssign(item.type, item.name, item.system);

            datas.push(item);
        }

        // @ts-ignore
        return await Item.create(datas) as Item;
    }
}
