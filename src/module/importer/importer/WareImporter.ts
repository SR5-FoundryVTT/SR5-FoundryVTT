import { DataImporter } from './DataImporter';
import { ImportHelper } from '../helper/ImportHelper';
import { CyberwareParser } from '../parser/ware/CyberwareParser';
import Ware = Shadowrun.WareItemData;
import {DefaultValues} from "../../data/DataDefaults";
import CyberwareItemData = Shadowrun.CyberwareItemData;
import {Helpers} from "../../helpers";

export class WareImporter extends DataImporter {
    public categoryTranslations: any;
    public itemTranslations: any;
    public files = ['cyberware.xml', 'bioware.xml'];

    CanParse(jsonObject: object): boolean {
        return jsonObject.hasOwnProperty('cyberwares') && jsonObject['cyberwares'].hasOwnProperty('cyberware') ||
               jsonObject.hasOwnProperty('biowares') && jsonObject['biowares'].hasOwnProperty('bioware');
    }

    GetDefaultCyberwareData(): CyberwareItemData {
        //@ts-ignore // Bio/Cyberware conflicts on 'type'...
        return {...this.GetDefaultData(), type: 'cyberware'};
    }

    GetDefaultBiowareData(): CyberwareItemData {
        //@ts-ignore // Bio/Cyberware conflicts on 'type'...
        return {...this.GetDefaultData(), type: 'bioware'};
    }

    GetDefaultData(): Ware {
        return {
            name: 'Unnamed Form',
            type: 'cyberware',
            data: {
                description: {
                    value: '',
                    chat: '',
                    source: '',
                },
                technology: DefaultValues.technologyData({rating: 1}),
                armor: {
                    value: 0,
                    mod: false,
                    acid: 0,
                    cold: 0,
                    fire: 0,
                    electricity: 0,
                    radiation: 0,
                },
                action: DefaultValues.actionData(),
                grade: 'standard',
                essence: 0,
                capacity: 0,
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

    async Parse(jsonObject: object): Promise<Item> {
        const cyberParser = new CyberwareParser();

        let key = jsonObject.hasOwnProperty('cyberwares') ? 'Cyberware' : 'Bioware';
        const folders = await ImportHelper.MakeCategoryFolders(jsonObject, key);

        key = key.toLowerCase();
        let datas: Ware[] = [];
        let jsonDatas = jsonObject[key + 's'][key];
        for (let i = 0; i < jsonDatas.length; i++) {
            let jsonData = jsonDatas[i];

            if (DataImporter.unsupportedEntry(jsonData)) {
                continue;
            }

            const defaultData = key === 'cyberware' ? this.GetDefaultCyberwareData() : this.GetDefaultBiowareData();
            let data = cyberParser.Parse(jsonData, defaultData, this.itemTranslations);
            const category = ImportHelper.StringValue(jsonData, 'category');

            // TODO: Does this type mixture cause later issues? Will it carry over?
            //@ts-ignore
            data.folder = folders[category.toLowerCase()].id;

            // // TODO: Follow ComplexFormParserBase approach.
            // data.name = ImportHelper.MapNameToTranslation(this.itemTranslations, data.name);
            Helpers.injectActionTestsIntoChangeData(data.type, data, data);

            datas.push(data);
        }

        // @ts-ignore // TODO: TYPE: Remove this.
        return await Item.create(datas);
    }
}
