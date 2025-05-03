import { DataImporter } from "./DataImporter";
import { ImportHelper } from "../helper/ImportHelper";
import { Constants } from "./Constants";
import { UpdateActionFlow } from "../../../item/flows/UpdateActionFlow";

export class EquipmentImporter extends DataImporter<Shadowrun.EquipmentItemData, Shadowrun.EquipmentData> {
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

        const jsonGeari18n = ImportHelper.ExtractDataFileTranslation(DataImporter.jsoni18n, this.files[0]);
        this.categoryTranslations = ImportHelper.ExtractCategoriesTranslation(jsonGeari18n);
        this.itemTranslations = ImportHelper.ExtractItemTranslation(jsonGeari18n, 'gears', 'gear');
    }

    async ParseEquipment(equipments, setIcons) {
        const items: Shadowrun.EquipmentItemData[] = [];
        this.iconList = await this.getIconFiles();
        const parserType = 'equipment';

        for (const equipment of equipments) {

            // Check to ensure the data entry is supported
            if (DataImporter.unsupportedEntry(equipment)) {
                continue;
            }

            // It might be advantageous to not double import rockets, grenades, or mini-torpedos, which also show up as weapons
            // They should probably be removed from one category or the other

            // Create the item
            const item = this.GetDefaultData({type: parserType, entityType: "Item"});
            item.name = ImportHelper.StringValue(equipment, 'name');

            // Get the equipment category
            const categoryEN = ImportHelper.StringValue(equipment, 'category');

            // Get the item's folder information
            // Replace / as it's used as a separator in GetFolderAtPath.
            const category = ImportHelper.TranslateCategory(categoryEN, this.categoryTranslations).replace('/', ' ');
            const categoryFolder = await ImportHelper.GetFolderAtPath("Item", `${Constants.ROOT_IMPORT_FOLDER_NAME}/${game.i18n.localize('SR5.Gear')}/${category}`, true);
            // @ts-expect-error TODO: foundry-vtt-types v10
            item.folder = categoryFolder.id;

            // Import Flags
            item.system.importFlags = this.genImportFlags(item.name, item.type, this.formatAsSlug(categoryEN));

            // Default icon
            if (setIcons) {item.img = await this.iconAssign(item.system.importFlags, item.system, this.iconList)};

            // Finish the importing
            item.system.description.source = `${ImportHelper.StringValue(equipment, 'source')} ${ImportHelper.MapNameToPageSource(this.itemTranslations, ImportHelper.StringValue(equipment, 'name'), ImportHelper.StringValue(equipment, 'page'))}`;
            item.system.technology.rating = ImportHelper.IntValue(equipment, 'rating', 0);
            item.system.technology.availability = ImportHelper.StringValue(equipment, 'avail');
            item.system.technology.cost = ImportHelper.IntValue(equipment, 'cost', 0);

            // Translate name if needed
            item.name = ImportHelper.MapNameToTranslation(this.itemTranslations, item.name);

            // Add relevant action tests
            UpdateActionFlow.injectActionTestsIntoChangeData(item.type, item, item);

            items.push(item);
        }

        return items;
    }

    async Parse(jsonObject: object, setIcons: boolean): Promise<Item> {
        const equipment = this.filterObjects(jsonObject['gears']['gear']);
        const items = await this.ParseEquipment(equipment, setIcons);

        // @ts-expect-error // TODO: TYPE: Remove this.
        return await Item.create(items);
    }
}