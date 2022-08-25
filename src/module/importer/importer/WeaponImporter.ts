import { DataImporter } from './DataImporter';
import { ImportHelper } from '../helper/ImportHelper';
import { Constants } from './Constants';
import { RangedParser } from '../parser/weapon/RangedParser';
import { MeleeParser } from '../parser/weapon/MeleeParser';
import { ThrownParser } from '../parser/weapon/ThrownParser';
import { ParserMap } from '../parser/ParserMap';
import { WeaponParserBase } from '../parser/weapon/WeaponParserBase';
import {DefaultValues} from "../../data/DataDefaults";
import WeaponItemData = Shadowrun.WeaponItemData;
import {Helpers} from "../../helpers";

export class WeaponImporter extends DataImporter {
    public categoryTranslations: any;
    public itemTranslations: any;
    public files = ['weapons.xml'];

    CanParse(jsonObject: object): boolean {
        return jsonObject.hasOwnProperty('weapons') && jsonObject['weapons'].hasOwnProperty('weapon');
    }

    GetDefaultData(): WeaponItemData {
        return {
            name: 'Unnamed Item',
            type: 'weapon',
            data: {
                description: {
                    value: '',
                    chat: '',
                    source: '',
                },
                action: DefaultValues.actionData({type: 'varies', attribute: 'agility'}),
                technology: DefaultValues.technologyData({rating: 1}),
                ammo: {
                    spare_clips: {
                        value: 0,
                        max: 0,
                    },
                    current: {
                        value: 0,
                        max: 0,
                    },
                },
                range: {
                    category: '',
                    ranges: {
                        short: 0,
                        medium: 0,
                        long: 0,
                        extreme: 0,
                    },
                    rc: {
                        value: 0,
                        base: 0,
                        mod: [],
                    },
                    modes: {
                        single_shot: false,
                        semi_auto: false,
                        burst_fire: false,
                        full_auto: false,
                    },
                },
                melee: {
                    reach: 0,
                },
                thrown: {
                    ranges: {
                        short: 0,
                        medium: 0,
                        long: 0,
                        extreme: 0,
                        attribute: '',
                    },
                    blast: {
                        radius: 0,
                        dropoff: 0,
                    },
                },
                category: 'range',
                subcategory: '',
            },
        };
    }

    ExtractTranslation() {
        if (!DataImporter.jsoni18n) {
            return;
        }

        let jsonWeaponi18n = ImportHelper.ExtractDataFileTranslation(DataImporter.jsoni18n, this.files[0]);
        this.categoryTranslations = ImportHelper.ExtractCategoriesTranslation(jsonWeaponi18n);
        this.itemTranslations = ImportHelper.ExtractItemTranslation(jsonWeaponi18n, 'weapons', 'weapon');
    }

    async Parse(jsonObject: object): Promise<Item> {
        const folders = await ImportHelper.MakeCategoryFolders(jsonObject, 'Weapons', this.categoryTranslations);

        folders['gear'] = await ImportHelper.GetFolderAtPath(`${Constants.ROOT_IMPORT_FOLDER_NAME}/Weapons/Gear`, true);
        folders['quality'] = await ImportHelper.GetFolderAtPath(`${Constants.ROOT_IMPORT_FOLDER_NAME}/Weapons/Quality`, true);

        const parser = new ParserMap<WeaponItemData>(WeaponParserBase.GetWeaponType, [
            { key: 'range', value: new RangedParser() },
            { key: 'melee', value: new MeleeParser() },
            { key: 'thrown', value: new ThrownParser() },
        ]);

        let datas: WeaponItemData[] = [];
        let jsonDatas = jsonObject['weapons']['weapon'];
        for (let i = 0; i < jsonDatas.length; i++) {
            let jsonData = jsonDatas[i];

            if (DataImporter.unsupportedEntry(jsonData)) {
                continue;
            }

            let data = parser.Parse(jsonData, this.GetDefaultData(), this.itemTranslations);
            // @ts-ignore // TODO: Foundry Where is my foundry base data?
            data.folder = folders[data.data.subcategory].id;

            Helpers.injectActionTestsIntoChangeData(data.type, data, data);

            datas.push(data);
        }

        // @ts-ignore // TODO: TYPE: This should be removed after typing of SR5Item
        return await Item.create(datas);
    }
}
