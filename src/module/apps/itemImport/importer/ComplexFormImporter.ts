import { DataImporter } from './DataImporter';
import { ImportHelper } from '../helper/ImportHelper';
import { Constants } from './Constants';
import { ComplexFormParserBase } from '../parser/complex-form/ComplexFormParserBase';
import { DataDefaults } from '../../../data/DataDefaults';

import { UpdateActionFlow } from '../../../item/flows/UpdateActionFlow';

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
        const jsonItemi18n = ImportHelper.ExtractDataFileTranslation(DataImporter.jsoni18n, this.files[0]);
        this.nameTranslations = ImportHelper.ExtractItemTranslation(jsonItemi18n, 'complexforms', 'complexform');
    }

    async Parse(jsonObject: object, setIcons: boolean): Promise<Item> {
        const parser = new ComplexFormParserBase();
        const folder = await ImportHelper.GetFolderAtPath(`${Constants.ROOT_IMPORT_FOLDER_NAME}/Complex Forms`, true);
        const items: Shadowrun.ComplexFormItemData[] = [];
        const jsonDatas = jsonObject['complexforms']['complexform'];
        this.iconList = await this.getIconFiles();
        const parserType = 'complex_form';

        for (let i = 0; i < jsonDatas.length; i++) {
            const jsonData = jsonDatas[i];

            // Check to ensure the data entry is supported
            if (DataImporter.unsupportedEntry(jsonData)) {
                continue;
            }

            // Create the item
            const item = parser.Parse(jsonData, this.GetDefaultData({type: parserType}), this.nameTranslations);

            // Get the item's folder information
            // @ts-expect-error TODO: Foundry Where is my foundry base data?
            item.folder = folder.id;

            // Import Flags
            item.system.importFlags = this.genImportFlags(item.name, item.type, '');

            // Default icon
            if (setIcons) {item.img = await this.iconAssign(item.system.importFlags, item.system, this.iconList)};

            // TODO: Follow ComplexFormParserBase approach.
            // Item name translation
            item.name = ImportHelper.MapNameToTranslation(this.nameTranslations, item.name);

            // Add relevant action tests
            UpdateActionFlow.injectActionTestsIntoChangeData(item.type, item, item);

            items.push(item);
        }

        // @ts-expect-error // TODO: foundry-vtt-types v10 / Might not be solved by an update...
        return await Item.create(items) as Item;
    }
}
