import { DataImporter } from './DataImporter';
import { ImportHelper } from '../helper/ImportHelper';
import { ArmorParserBase } from '../parser/armor/ArmorParserBase';
import ArmorItemData = Shadowrun.ArmorItemData;
import {DefaultValues} from "../../data/DataDefaults";
import {Helpers} from "../../helpers";

export class ArmorImporter extends DataImporter {
    public armorTranslations: any;
    public categoryTranslations: any;
    public files = ['armor.xml'];

    CanParse(jsonObject: object): boolean {
        return jsonObject.hasOwnProperty('armors') && jsonObject['armors'].hasOwnProperty('armor');
    }

    GetDefaultData(): ArmorItemData {
        return {
            name: 'Unnamed Armor',
            type: 'armor',
            data: {
                description: {
                    value: '',
                    chat: '',
                    source: '',
                },
                technology: DefaultValues.technologyData({rating: 1, equipped: true, wireless: false}),
                armor: {
                    value: 0,
                    mod: false,
                    acid: 0,
                    cold: 0,
                    fire: 0,
                    electricity: 0,
                    radiation: 0,
                },
            },
        };
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

            let data = parser.Parse(jsonData, this.GetDefaultData());
            const category = ImportHelper.StringValue(jsonData, 'category').toLowerCase();
            data.name = ImportHelper.MapNameToTranslation(this.armorTranslations, data.name);
            // @ts-ignore TODO: Foundry Where is my foundry base data?
            data.folder = folders[category].id;

            Helpers.injectActionTestsIntoChangeData(data.type, data, data);

            datas.push(data);
        }

        // @ts-ignore
        return await Item.create(datas) as Item;
    }
}
