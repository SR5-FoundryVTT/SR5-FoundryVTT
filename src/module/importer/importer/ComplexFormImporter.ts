import { DataImporter } from './DataImporter';
import { ImportHelper } from '../helper/ImportHelper';
import { Constants } from './Constants';
import { ComplexFormParserBase } from '../parser/complex-form/ComplexFormParserBase';
import {Helpers} from "../../helpers";
import { DataDefaults } from '../../data/DataDefaults';

export class ComplexFormImporter extends DataImporter<Shadowrun.ComplexFormItemData, Shadowrun.ComplexFormData> {
    public override categoryTranslations: any;
    public nameTranslations: any;
    public files = ['complexforms.xml'];

    CanParse(jsonObject: object): boolean {
        return jsonObject.hasOwnProperty('complexforms') && jsonObject['complexforms'].hasOwnProperty('complexform');
    }

    public override GetDefaultData({ type }: { type: any; }): Shadowrun.ComplexFormItemData {
        const systemData = {action: {type: 'complex', attribute: 'resonance', skill: 'compiling'}} as Shadowrun.ComplexFormData;
        return DataDefaults.baseItemData<Shadowrun.ComplexFormItemData, Shadowrun.ComplexFormData>({type}, systemData);
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

        let items: Shadowrun.ComplexFormItemData[] = [];
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
