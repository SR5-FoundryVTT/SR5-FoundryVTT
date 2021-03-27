import {DataImporter} from './DataImporter';
import {ImportHelper} from '../helper/ImportHelper';
import {CritterPowerParserBase} from '../parser/critter-power/CritterPowerParserBase';
import {Constants} from './Constants';
import {DefaultValues} from "../../dataTemplates";
import CritterPower = Shadowrun.CritterPower;

export class CritterPowerImporter extends DataImporter {
    public categoryTranslations: any;
    public itemTranslations: any;
    public files = ['critterpowers.xml'];

    CanParse(jsonObject: object): boolean {
        return jsonObject.hasOwnProperty('powers') && jsonObject['powers'].hasOwnProperty('power');
    }

    GetDefaultData(): CritterPower {
        return {
            name: 'Unnamed Item',
            _id: '',
            folder: '',
            img: 'icons/svg/mystery-man.svg',
            flags: {},
            type: 'critter_power',
            effects: [],
            sort: 0,
            data: {
                description: {
                    value: '',
                    chat: '',
                    source: '',
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
                    damage: DefaultValues.damageData({type: {base: '', value: ''}}),
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
                armor: {
                    value: 0,
                    mod: false,
                    acid: 0,
                    cold: 0,
                    fire: 0,
                    electricity: 0,
                    radiation: 0,
                },
                category: '',
                powerType: '',
                range: '',
                duration: '',
                karma: 0,
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

        let jsonCritterPoweri18n = ImportHelper.ExtractDataFileTranslation(DataImporter.jsoni18n, this.files[0]);
        this.categoryTranslations = ImportHelper.ExtractCategoriesTranslation(jsonCritterPoweri18n);
        this.itemTranslations = ImportHelper.ExtractItemTranslation(jsonCritterPoweri18n, 'powers', 'power');
    }

    async Parse(jsonObject: object): Promise<Entity> {
        const parser = new CritterPowerParserBase();
        const folder = await ImportHelper.GetFolderAtPath(`${Constants.ROOT_IMPORT_FOLDER_NAME}/Critter Powers`, true);

        let datas: CritterPower[] = [];
        let jsonDatas = jsonObject['powers']['power'];
        for (let i = 0; i < jsonDatas.length; i++) {
            let jsonData = jsonDatas[i];

            let data = parser.Parse(jsonData, this.GetDefaultData(), this.itemTranslations);
            data.folder = folder.id;
            data.name = ImportHelper.MapNameToTranslation(this.itemTranslations, data.name);

            datas.push(data);
        }

        // @ts-ignore // TODO: TYPE: Remove this.
        return await Item.create(datas);
    }
}
