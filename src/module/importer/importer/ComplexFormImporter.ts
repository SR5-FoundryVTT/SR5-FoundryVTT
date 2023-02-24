import { DataImporter } from './DataImporter';
import { ImportHelper } from '../helper/ImportHelper';
import { Constants } from './Constants';
import { ComplexFormParserBase } from '../parser/complex-form/ComplexFormParserBase';
import ComplexFormItemData = Shadowrun.ComplexFormItemData;
import {Helpers} from "../../helpers";

export class ComplexFormImporter extends DataImporter<ComplexFormItemData> {
    public categoryTranslations: any;
    public nameTranslations: any;
    public files = ['complexforms.xml'];

    CanParse(jsonObject: object): boolean {
        return jsonObject.hasOwnProperty('complexforms') && jsonObject['complexforms'].hasOwnProperty('complexform');
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

        let items: ComplexFormItemData[] = [];
        let jsonDatas = jsonObject['complexforms']['complexform'];
        for (let i = 0; i < jsonDatas.length; i++) {
            let jsonData = jsonDatas[i];
            if (DataImporter.unsupportedEntry(jsonData)) {
                continue;
            }

            let item = parser.Parse(jsonData, this.GetDefaultData({type: 'complex_form'}), this.nameTranslations);

            // @ts-ignore TODO: Foundry Where is my foundry base data?
            item.folder = folder.id;

            // TODO: Follow ComplexFormParserBase approach.
            item.name = ImportHelper.MapNameToTranslation(this.nameTranslations, item.name);

            Helpers.injectActionTestsIntoChangeData(item.type, item, item);

            items.push(item);
        }

        // @ts-ignore
        return await Item.create(items) as Item;
    }
}
