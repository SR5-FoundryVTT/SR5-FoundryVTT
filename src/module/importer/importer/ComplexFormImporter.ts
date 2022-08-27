import { DataImporter } from './DataImporter';
import { ImportHelper } from '../helper/ImportHelper';
import { Constants } from './Constants';
import { ComplexFormParserBase } from '../parser/complex-form/ComplexFormParserBase';
import {DefaultValues} from "../../data/DataDefaults";
import ComplexFormItemData = Shadowrun.ComplexFormItemData;
import {Helpers} from "../../helpers";

export class ComplexFormImporter extends DataImporter {
    public categoryTranslations: any;
    public nameTranslations: any;
    public files = ['complexforms.xml'];

    CanParse(jsonObject: object): boolean {
        return jsonObject.hasOwnProperty('complexforms') && jsonObject['complexforms'].hasOwnProperty('complexform');
    }

    GetDefaultData(): ComplexFormItemData {
        return {
            name: 'Unnamed Form',
            type: 'complex_form',
            data: {
                description: {
                    value: '',
                    chat: '',
                    source: '',
                },
                action: DefaultValues.actionData({
                    type: 'complex',
                    attribute: 'resonance',
                    skill: 'compiling'
                }),
                target: '',
                duration: '',
                fade: 0,
            },
        };
    }

    ExtractTranslation() {
        if (!DataImporter.jsoni18n) {
            return;
        }

        // Complexforms don't provide a category translation.
        let jsonItemi18n = ImportHelper.ExtractDataFileTranslation(DataImporter.jsoni18n, this.files[0]);
        this.nameTranslations = ImportHelper.ExtractItemTranslation(jsonItemi18n, 'complexforms', 'complexform');
    }

    async Parse(jsonObject: object): Promise<Item> {
        const parser = new ComplexFormParserBase();
        const folder = await ImportHelper.GetFolderAtPath(`${Constants.ROOT_IMPORT_FOLDER_NAME}/Complex Forms`, true);

        let datas: ComplexFormItemData[] = [];
        let jsonDatas = jsonObject['complexforms']['complexform'];
        for (let i = 0; i < jsonDatas.length; i++) {
            let jsonData = jsonDatas[i];
            if (DataImporter.unsupportedEntry(jsonData)) {
                continue;
            }

            let data = parser.Parse(jsonData, this.GetDefaultData(), this.nameTranslations);

            // @ts-ignore TODO: Foundry Where is my foundry base data?
            data.folder = folder.id;

            // TODO: Follow ComplexFormParserBase approach.
            data.name = ImportHelper.MapNameToTranslation(this.nameTranslations, data.name);

            Helpers.injectActionTestsIntoChangeData(data.type, data, data);

            datas.push(data);
        }

        // @ts-ignore
        return await Item.create(datas) as Item;
    }
}
