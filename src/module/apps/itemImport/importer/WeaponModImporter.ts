import { DataImporter } from './DataImporter';
import { ImportHelper } from '../helper/ImportHelper';
import { Constants } from './Constants';
import { WeaponModParserBase } from '../parser/mod/WeaponModParserBase';
import { UpdateActionFlow } from '../../../item/flows/UpdateActionFlow';

export class WeaponModImporter extends DataImporter<Shadowrun.ModificationItemData, Shadowrun.ModificationData> {
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
        const parser = new WeaponModParserBase();
        let datas: Shadowrun.ModificationItemData[] = [];
        let jsonDatas = jsonObject['accessories']['accessory'];
        this.iconList = await this.getIconFiles();
        const parserType = 'modification';

        for (let i = 0; i < jsonDatas.length; i++) {
            let jsonData = jsonDatas[i];

            // Check to ensure the data entry is supported
            if (DataImporter.unsupportedEntry(jsonData)) {
                continue;
            }

            // Create the item
            let item = parser.Parse(jsonData, this.GetDefaultData({type: parserType, entityType: "Item"}));

            // Get the item's folder information
            let folderName = item.system.mount_point !== undefined ? item.system.mount_point : 'Other';
            if (folderName.includes('/')) {
                let splitName = folderName.split('/');
                folderName = splitName[0];
            }
            let folder = await ImportHelper.GetFolderAtPath("Item", `${Constants.ROOT_IMPORT_FOLDER_NAME}/Weapon-Mods/${folderName}`, true);
            //@ts-expect-error TODO: Foundry Where is my foundry base data?
            item.folder = folder.id;

            // Import Flags
            item.system.importFlags = this.genImportFlags(item.name, item.type, this.formatAsSlug(folderName));

            // Default icon
            if (setIcons) {item.img = await this.iconAssign(item.system.importFlags, item.system, this.iconList)};

            // Translate name if needed
            item.name = ImportHelper.MapNameToTranslation(this.accessoryTranslations, item.name);

            // Add relevant action tests
            UpdateActionFlow.injectActionTestsIntoChangeData(item.type, item, item);

            datas.push(item);
        }

        // @ts-expect-error // TODO: TYPE: Remove this.
        return await Item.create(datas);
    }
}
