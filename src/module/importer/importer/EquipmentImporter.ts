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

    async ParseEquipment(equipments, setIcons) {
        const items = [];
        const parserType = 'equipment';

        for (const equipment of equipments) {

            // Check to ensure the data entry is supported
            if (DataImporter.unsupportedEntry(equipment)) {
                continue;
            }

            // Create the item
            const item = this.GetDefaultData({type: parserType});
            item.name = ImportHelper.StringValue(equipment, 'name');

            // Get the equipment category
            const categoryEN = ImportHelper.StringValue(equipment, 'category');

            // Get the item's folder information
            // Replace / as it's used as a separator in GetFolderAtPath.
            const category = ImportHelper.TranslateCategory(categoryEN, this.categoryTranslations).replace('/', ' ');
            let categoryFolder = await ImportHelper.GetFolderAtPath(`${Constants.ROOT_IMPORT_FOLDER_NAME}/${game.i18n.localize('SR5.Gear')}/${category}`, true);
            //@ts-ignore
            item.folder = categoryFolder.id;

            // Import Flags
            item.system.importFlags = this.genImportFlags(item.name, item.type);

            // Add the subtype so the importer can add the correct icon
            let subType = this.formatSubtypeName(categoryEN);
            if (Object.keys(SR5.itemSubTypeIconOverrides[parserType]).includes(subType)) {
                item.system.importFlags.subType = subType;
            }

            // Default icon
            if (setIcons) item.img = await this.iconAssign(item.system.importFlags, item.system);

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

    async Parse(jsonObject: object, setIcons: boolean): Promise<Item> {
        const equipment = this.filterObjects(jsonObject['gears']['gear']);
        const items = await this.ParseEquipment(equipment, setIcons);

        // @ts-ignore // TODO: TYPE: Remove this.
        return await Item.create(items);
    }
}