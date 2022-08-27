import {DataImporter} from './DataImporter';
import {ImportHelper} from '../helper/ImportHelper';
import {CritterPowerParserBase} from '../parser/critter-power/CritterPowerParserBase';
import {Constants} from './Constants';
import {DefaultValues} from "../../data/DataDefaults";
import CritterPowerItemData = Shadowrun.CritterPowerItemData;
import {Helpers} from "../../helpers";

export class CritterPowerImporter extends DataImporter {
    public categoryTranslations: any;
    public itemTranslations: any;
    public files = ['critterpowers.xml'];

    CanParse(jsonObject: object): boolean {
        return jsonObject.hasOwnProperty('powers') && jsonObject['powers'].hasOwnProperty('power');
    }

    GetDefaultData(): CritterPowerItemData {
        return {
            name: 'Unnamed Item',
            type: 'critter_power',
            data: {
                description: {
                    value: '',
                    chat: '',
                    source: '',
                },
                action: DefaultValues.actionData({
                    damage: DefaultValues.damageData({type: {base: '', value: ''}}),
                }),
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

    async Parse(jsonObject: object): Promise<Item> {
        const parser = new CritterPowerParserBase();
        const folder = await ImportHelper.GetFolderAtPath(`${Constants.ROOT_IMPORT_FOLDER_NAME}/Critter Powers`, true);

        let datas: CritterPowerItemData[] = [];
        let jsonDatas = jsonObject['powers']['power'];
        for (let i = 0; i < jsonDatas.length; i++) {
            let jsonData = jsonDatas[i];

            let data = parser.Parse(jsonData, this.GetDefaultData(), this.itemTranslations);

            // @ts-ignore TODO: Foundry Where is my foundry base data?
            data.folder = folder.id;
            data.name = ImportHelper.MapNameToTranslation(this.itemTranslations, data.name);

            Helpers.injectActionTestsIntoChangeData(data.type, data, data);

            datas.push(data);
        }

        // @ts-ignore // TODO: TYPE: Remove this.
        return await Item.create(datas);
    }
}
