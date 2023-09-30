import { DataImporter } from './DataImporter';
import { ImportHelper } from '../helper/ImportHelper';
import { Constants } from './Constants';
import { ModParserBase } from '../parser/mod/ModParserBase';
import ModificationItemData = Shadowrun.ModificationItemData;
import {Helpers} from "../../helpers";
import { SR5 } from "../../config";

export class ModImporter extends DataImporter<ModificationItemData, Shadowrun.ModificationData> {
    public override categoryTranslations: any;
    public accessoryTranslations: any;
    public files = ['weapons.xml'];

    CanParse(jsonObject: object): boolean {
        return jsonObject.hasOwnProperty('accessories') && jsonObject['accessories'].hasOwnProperty('accessory');
    }

    ExtractTranslation() {
        if (!DataImporter.jsoni18n) {
            return;
        }

        let jsonWeaponsi18n = ImportHelper.ExtractDataFileTranslation(DataImporter.jsoni18n, this.files[0]);
        // Parts of weapon accessory translations are within the application translation. Currently only data translation is used.
        this.accessoryTranslations = ImportHelper.ExtractItemTranslation(jsonWeaponsi18n, 'accessories', 'accessory');
    }

    async Parse(jsonObject: object, setIcons: boolean): Promise<Item> {
        const parser = new ModParserBase();
        let datas: ModificationItemData[] = [];
        let jsonDatas = jsonObject['accessories']['accessory'];
        const parserType = 'modification';

        for (let i = 0; i < jsonDatas.length; i++) {
            let jsonData = jsonDatas[i];

            // Check to ensure the data entry is supported
            if (DataImporter.unsupportedEntry(jsonData)) {
                continue;
            }

            // Create the item
            let item = parser.Parse(jsonData, this.GetDefaultData({type: parserType}));

            // Get the item's folder information
            let folderName = item.system.mount_point !== undefined ? item.system.mount_point : 'Other';
            if (folderName.includes('/')) {
                let splitName = folderName.split('/');
                folderName = splitName[0];
            }
            let folder = await ImportHelper.GetFolderAtPath(`${Constants.ROOT_IMPORT_FOLDER_NAME}/Mods/${folderName}`, true);
            //@ts-ignore TODO: Foundry Where is my foundry base data?
            item.folder = folder.id;

            // Import Flags
            item.system.importFlags = this.genImportFlags(item.name, item.type);

            // Add the subtype so the importer can add the correct icon
            let subType = this.formatSubtypeName(folderName);
            if (Object.keys(SR5.itemSubTypeIconOverrides[parserType]).includes(subType)) {
                item.system.importFlags.subType = subType;
            }

            // Default icon
            if (setIcons) item.img = await this.iconAssign(item.system.importFlags, item.system);

            // Translate name if needed
            item.name = ImportHelper.MapNameToTranslation(this.accessoryTranslations, item.name);

            // Add relevant action tests
            Helpers.injectActionTestsIntoChangeData(item.type, item, item);

            datas.push(item);
        }

        // @ts-ignore // TODO: TYPE: Remove this.
        return await Item.create(datas);
    }
}
