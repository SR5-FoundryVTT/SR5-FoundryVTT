import {DataImporter} from "./DataImporter";
import {ImportHelper} from "../helper/ImportHelper";
import {Constants} from "./Constants";
import EquipmentItemData = Shadowrun.EquipmentItemData;
import {Helpers} from "../../helpers";
import { SR5 } from "../../config";

export class EquipmentImporter extends DataImporter<EquipmentItemData, Shadowrun.EquipmentData> {
    files = ['gear.xml'];
    override unsupportedCategories = [
        'Ammunition',
        'Commlinks',
        'Cyberdecks',
        'Hacking Programs',
        'Common Programs',
        'Rigger Command Consoles',
        'Custom'
    ];

    CanParse(jsonObject: object): boolean {
        return jsonObject.hasOwnProperty('gears') && jsonObject['gears'].hasOwnProperty('gear');
    }

    ExtractTranslation(fileName?: string) {
        if (!DataImporter.jsoni18n) {
            return;
        }

        let jsonGeari18n = ImportHelper.ExtractDataFileTranslation(DataImporter.jsoni18n, this.files[0]);
        this.categoryTranslations = ImportHelper.ExtractCategoriesTranslation(jsonGeari18n);
        this.itemTranslations = ImportHelper.ExtractItemTranslation(jsonGeari18n, 'gears', 'gear');
    }

    async ParseEquipments(equipments) {
        const items = [];

        for (const equipment of equipments) {

            // Check to ensure the data entry is supported
            if (DataImporter.unsupportedEntry(equipment)) {
                continue;
            }

            // Create the item
            const item = this.GetDefaultData({type: 'equipment'});
            item.name = ImportHelper.StringValue(equipment, 'name');

            // Get the equipment category
            const categoryEN = ImportHelper.StringValue(equipment, 'category')

            // Get the item's folder information
            // Replace / as it's used as a separator in GetFolderAtPath.
            const category = ImportHelper.TranslateCategory(categoryEN, this.categoryTranslations).replace('/', ' ');
            let categoryFolder = await ImportHelper.GetFolderAtPath(`${Constants.ROOT_IMPORT_FOLDER_NAME}/${game.i18n.localize('SR5.Gear')}/${category}`, true);
            //@ts-ignore
            item.folder = categoryFolder.id;

            // Import Flags
            item.system.importFlags.name = foundry.utils.deepClone(item.name); // original english name for matching to icons
            item.system.importFlags.type = item.type;
            item.system.importFlags.subType = '';
            item.system.importFlags.isFreshImport = true;

            // Add the subtype so the importer can add the correct icon
            let subType = categoryEN.trim().toLowerCase().replace('/', ' ').split(' ').join('-');
            if (SR5.itemSubTypes.equipment.includes(subType)) {
                item.system.importFlags.subType = subType;
            }

            // Default icon
            item.img = await this.iconAssign(item.system.importFlags, item.system);

            // Finish the importing
            item.system.description.source = `${ImportHelper.StringValue(equipment, 'source')} ${ImportHelper.MapNameToPageSource(this.itemTranslations, ImportHelper.StringValue(equipment, 'name'), ImportHelper.StringValue(equipment, 'page'))}`;
            item.system.technology.rating = ImportHelper.IntValue(equipment, 'rating', 0);
            item.system.technology.availability = ImportHelper.StringValue(equipment, 'avail');
            item.system.technology.cost = ImportHelper.IntValue(equipment, 'cost', 0);

            // Translate name if needed
            item.name = ImportHelper.MapNameToTranslation(this.itemTranslations, item.name);

            // Add relevant action tests
            Helpers.injectActionTestsIntoChangeData(item.type, item, item);

            //@ts-ignore
            items.push(item);
        }

        return items;
    }

    async Parse(jsonObject: object): Promise<Item> {
        const equipments = this.filterObjects(jsonObject['gears']['gear']);
        const items = await this.ParseEquipments(equipments);

        // @ts-ignore // TODO: TYPE: Remove this.
        return await Item.create(items);
    }
}