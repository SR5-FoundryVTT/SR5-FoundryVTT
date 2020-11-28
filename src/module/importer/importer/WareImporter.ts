import { DataImporter } from './DataImporter';
import { ImportHelper } from '../helper/ImportHelper';
import { CyberwareParser } from '../parser/ware/CyberwareParser';
import Ware = Shadowrun.Ware;
import Cyberware = Shadowrun.Cyberware;
import Bioware = Shadowrun.Bioware;

export class WareImporter extends DataImporter {
    public categoryTranslations: any;
    public itemTranslations: any;
    public files = ['cyberware.xml', 'bioware.xml'];

    CanParse(jsonObject: object): boolean {
        return jsonObject.hasOwnProperty('cyberwares') && jsonObject['cyberwares'].hasOwnProperty('cyberware') ||
               jsonObject.hasOwnProperty('biowares') && jsonObject['biowares'].hasOwnProperty('bioware');
    }

    GetDefaultCyberwareData(): Cyberware {
        return {...this.GetDefaultData(), type: 'cyberware'} as unknown as Cyberware;
    }

    GetDefaultBiowareData(): Cyberware {
        return {...this.GetDefaultData(), type: 'bioware'} as unknown as Bioware;
    }

    GetDefaultData(): Ware {
        return {
            name: 'Unnamed Form',
            type: 'cyberware',
            _id: '',
            folder: null,
            img: 'icons/svg/mystery-man.svg',
            flags: {},
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
    ExtractTranslation(fileName) {
        if (!DataImporter.jsoni18n) {
            return;
        }

        let jsonItemi18n = ImportHelper.ExtractDataFileTranslation(DataImporter.jsoni18n, fileName);
         // TODO: Move ExtractTranslation phase before the parsing phase and initiate it with the filename to parse.
            if (this.files.length !== 2) console.error('Lazily hacked code will fail for more or less than two files.');

        this.categoryTranslations = ImportHelper.ExtractCategoriesTranslation(jsonItemi18n);

        const {typeKey, listKey} = fileName === 'cyberware.xml' ?
                {typeKey: 'cyberwares', listKey: 'cyberware'} :
                {typeKey: 'biowares', listKey: 'bioware'};

        this.itemTranslations = ImportHelper.ExtractItemTranslation(jsonItemi18n, typeKey, listKey);
    }

    async Parse(jsonObject: object): Promise<Entity> {
        console.error('Cyberwawre.Parse');
        const cyberParser = new CyberwareParser();

        let key = jsonObject.hasOwnProperty('cyberwares') ? 'Cyberware' : 'Bioware';
        const folders = await ImportHelper.MakeCategoryFolders(jsonObject, key);

        key = key.toLowerCase();
        let datas: Ware[] = [];
        let jsonDatas = jsonObject[key + 's'][key];
        for (let i = 0; i < jsonDatas.length; i++) {
            let jsonData = jsonDatas[i];

            const defaultData = key === 'cyberware' ? this.GetDefaultCyberwareData() : this.GetDefaultBiowareData();
            let data = cyberParser.Parse(jsonData, defaultData, this.itemTranslations);
            const category = ImportHelper.StringValue(jsonData, 'category');

            // TODO: Does this type mixture cause later issues? Will it carry over?
            //@ts-ignore
            data.folder = folders[category.toLowerCase()].id;

            // // TODO: Follow ComplexFormParserBase approach.
            // data.name = ImportHelper.MapNameToTranslation(this.itemTranslations, data.name);

            datas.push(data);
        }

        return await Item.create(datas);
    }
}
