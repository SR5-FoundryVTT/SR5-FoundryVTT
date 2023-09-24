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

    async Parse(jsonObject: object): Promise<Item> {
        const parser = new ModParserBase();

        let datas: ModificationItemData[] = [];
        let jsonDatas = jsonObject['accessories']['accessory'];
        for (let i = 0; i < jsonDatas.length; i++) {
            let jsonData = jsonDatas[i];

            if (DataImporter.unsupportedEntry(jsonData)) {
                continue;
            }

            let item = parser.Parse(jsonData, this.GetDefaultData({type: 'modification'}));

            // Save the item's original english name for matching to icons
            item.system.importFlags.name = foundry.utils.deepClone(item.name);
            item.system.importFlags.type = item.type;
            item.system.importFlags.subType = '';
            item.system.importFlags.isFreshImport = true;

            item.name = ImportHelper.MapNameToTranslation(this.accessoryTranslations, item.name);

            let folderName = item.system.mount_point !== undefined ? item.system.mount_point : 'Other';
            if (folderName.includes('/')) {
                let splitName = folderName.split('/');
                folderName = splitName[0];
            }

            let folder = await ImportHelper.GetFolderAtPath(`${Constants.ROOT_IMPORT_FOLDER_NAME}/Mods/${folderName}`, true);
            //@ts-ignore TODO: Foundry Where is my foundry base data?
            item.folder = folder.id;

            // Add the subtype so the importer can add the correct icon
            let subType = folderName.trim().toLowerCase();
            if (subType.includes(' ')) {
                subType = folderName.trim().split(' ').join('-');
            }
            if (SR5.itemSubTypes.modification.includes(subType)) {
                item.system.importFlags.subType = subType;
            }


            Helpers.injectActionTestsIntoChangeData(item.type, item, item);

            // TODO: Move this to a more general base class
            item.img = this.iconAssign(item.system.importFlags, item.system);

            datas.push(item);
        }

        // @ts-ignore // TODO: TYPE: Remove this.
        return await Item.create(datas);
    }
}
