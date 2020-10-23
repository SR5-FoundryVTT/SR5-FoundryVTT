import { DataImporter } from './DataImporter';
import { ImportHelper } from '../helper/ImportHelper';
import Armor = Shadowrun.Armor;
import { ArmorParserBase } from '../parser/armor/ArmorParserBase';

export class ArmorImporter extends DataImporter {
    public armorTranslations: any;
    public categoryTranslations: any;
    public file: string = 'armor.xml';

    CanParse(jsonObject: object): boolean {
        return jsonObject.hasOwnProperty('armors') && jsonObject['armors'].hasOwnProperty('armor');
    }

    GetDefaultData(): Armor {
        return {
            name: 'Unnamed Armor',
            _id: '',
            folder: null,
            img: 'icons/svg/mystery-man.svg',
            flags: {},
            type: 'armor',
            data: {
                description: {
                    value: '',
                    chat: '',
                    source: '',
                },
                technology: {
                    rating: 1,
                    availability: '',
                    quantity: 1,
                    cost: 0,
                    equipped: true,
                    conceal: {
                        base: 0,
                        value: 0,
                        mod: [],
                    },
                    condition_monitor: {
                        label: '',
                        value: 0,
                        max: 0,
                    },
                },
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
            permission: {
                default: 2,
            },
        };
    }

    ExtractTranslation() {
        if (!DataImporter.jsoni18n) {
            return;
        }

        let jsonArmori18n = ImportHelper.ExtractDataFileTranslation(DataImporter.jsoni18n, this.file);
        this.categoryTranslations = ImportHelper.ExtractCategoriesTranslation(jsonArmori18n);
        this.armorTranslations = ImportHelper.ExtractItemTranslation(jsonArmori18n, 'armors', 'armor');
    }

    async Parse(jsonObject: object): Promise<Entity> {
        const folders = await ImportHelper.MakeCategoryFolders(jsonObject, 'Armor', this.categoryTranslations);

        const parser = new ArmorParserBase();

        let datas: Armor[] = [];
        let jsonDatas = jsonObject['armors']['armor'];
        for (let i = 0; i < jsonDatas.length; i++) {
            let jsonData = jsonDatas[i];

            let data = parser.Parse(jsonData, this.GetDefaultData());
            const category = ImportHelper.StringValue(jsonData, 'category').toLowerCase();
            data.name = ImportHelper.MapNameToTranslation(this.armorTranslations, data.name);
            data.folder = folders[category].id;

            datas.push(data);
        }

        return await Item.create(datas);
    }
}
