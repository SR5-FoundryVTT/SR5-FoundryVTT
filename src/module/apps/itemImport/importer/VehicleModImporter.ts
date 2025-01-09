import { DataImporter } from './DataImporter';
import { ImportHelper } from '../helper/ImportHelper';
import { Constants } from './Constants';
import { VehicleModParserBase } from '../parser/mod/VehicleModParserBase';
import { UpdateActionFlow } from '../../../item/flows/UpdateActionFlow';

export class VehicleModImporter extends DataImporter<Shadowrun.ModificationItemData, Shadowrun.ModificationData> {
    public override categoryTranslations: any;
    public accessoryTranslations: any;
    public files = ['vehicles.xml'];

    CanParse(jsonObject: object): boolean {
        return jsonObject.hasOwnProperty('mods') && jsonObject['mods'].hasOwnProperty('mod');
    }

    ExtractTranslation() {
        if (!DataImporter.jsoni18n) {
            return;
        }

        const jsonWeaponsi18n = ImportHelper.ExtractDataFileTranslation(DataImporter.jsoni18n, this.files[0]);
        // Parts of weapon accessory translations are within the application translation. Currently only data translation is used.
        this.accessoryTranslations = ImportHelper.ExtractItemTranslation(jsonWeaponsi18n, 'mods', 'mod');
    }

    async Parse(jsonObject: object, setIcons: boolean): Promise<Item> {
        const parser = new VehicleModParserBase();
        const datas: Shadowrun.ModificationItemData[] = [];
        const jsonDatas = jsonObject['mods']['mod'];
        this.iconList = await this.getIconFiles();
        const parserType = 'modification';
        const enhancement  = ["Acceleration", "Armor", "Handling", "Sensor", "Speed"];

        for (let i = 0; i < jsonDatas.length; i++) {
            const jsonData = jsonDatas[i];

            // Check to ensure the data entry is supported
            if (DataImporter.unsupportedEntry(jsonData)) {
                continue;
            }

            // Create the item
            const item = parser.Parse(jsonData, this.GetDefaultData({type: parserType, entityType: "Item"}));

            const categoryName = ImportHelper.StringValue(jsonData, 'category');

            // Get the item's folder information
            const folderName = categoryName === undefined         ? "" :
                               enhancement.includes(categoryName) ? categoryName : "Other";

            const folder = await ImportHelper.GetFolderAtPath("Item", `${Constants.ROOT_IMPORT_FOLDER_NAME}/Vehicle-Mods/${folderName}`, true);
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
