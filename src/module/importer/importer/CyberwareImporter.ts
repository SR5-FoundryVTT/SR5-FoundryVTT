import { DataImporter } from './DataImporter';
import { ImportHelper } from '../helper/ImportHelper';
import Cyberware = Shadowrun.Cyberware;
import { CyberwareParser } from '../parser/cyberware/CyberwareParser';

export class CyberwareImporter extends DataImporter {
    public categoryTranslations: any;
    public itemTranslations: any;
    public file: string = 'cyberware.xml';

    CanParse(jsonObject: object): boolean {
        return (
            (jsonObject.hasOwnProperty('cyberwares') && jsonObject['cyberwares'].hasOwnProperty('cyberware')) ||
            (jsonObject.hasOwnProperty('biowares') && jsonObject['biowares'].hasOwnProperty('bioware'))
        );
    }

    GetDefaultData(): Cyberware {
        return {
            name: 'Unnamed Form',
            _id: '',
            folder: null,
            img: 'icons/svg/mystery-man.svg',
            flags: {},
            type: 'cyberware',
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
                action: {
                    type: '',
                    category: '',
                    attribute: '',
                    attribute2: '',
                    skill: '',
                    spec: false,
                    mod: 0,
                    mod_description: '',
                    damage: {
                        type: {
                            base: '',
                            value: '',
                        },
                        element: {
                            base: '',
                            value: '',
                        },
                        base: 0,
                        value: 0,
                        ap: {
                            base: 0,
                            value: 0,
                            mod: [],
                        },
                        attribute: '',
                        mod: [],
                    },
                    limit: {
                        value: 0,
                        attribute: '',
                        mod: [],
                        base: 0,
                    },
                    extended: false,
                    opposed: {
                        type: '',
                        attribute: '',
                        attribute2: '',
                        skill: '',
                        mod: 0,
                        description: '',
                    },
                    alt_mod: 0,
                    dice_pool_mod: [],
                },
                grade: 'standard',
                essence: 0,
                capacity: 0,
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

        let jsonItemi18n = ImportHelper.ExtractDataFileTranslation(DataImporter.jsoni18n, this.file);
        this.categoryTranslations = ImportHelper.ExtractCategoriesTranslation(jsonItemi18n);
        this.itemTranslations = ImportHelper.ExtractItemTranslation(jsonItemi18n, 'cyberwares', 'cyberware');
    }

    async Parse(jsonObject: object): Promise<Entity> {
        const parser = new CyberwareParser();
        let key = jsonObject.hasOwnProperty('cyberwares') ? 'Cyberware' : 'Bioware';
        const folders = await ImportHelper.MakeCategoryFolders(jsonObject, key);
        key = key.toLowerCase();

        let datas: Cyberware[] = [];
        let jsonDatas = jsonObject[key + 's'][key];
        for (let i = 0; i < jsonDatas.length; i++) {
            let jsonData = jsonDatas[i];

            let data = parser.Parse(jsonData, this.GetDefaultData(), this.itemTranslations);
            const category = ImportHelper.StringValue(jsonData, 'category');
            data.folder = folders[category.toLowerCase()].id;

            // // TODO: Follow ComplexFormParserBase approach.
            // data.name = ImportHelper.MapNameToTranslation(this.itemTranslations, data.name);

            datas.push(data);
        }

        return await Item.create(datas);
    }
}
