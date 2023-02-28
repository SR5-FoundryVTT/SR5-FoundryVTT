import {DataImporter} from "./DataImporter";
import {ImportHelper} from "../helper/ImportHelper";
import {Constants} from "./Constants";
import EquipmentItemData = Shadowrun.EquipmentItemData;
import {Helpers} from "../../helpers";

export class EquipmentImporter extends DataImporter<EquipmentItemData, Shadowrun.EquipmentData> {
    files = ['gear.xml'];
    unsupportedCategories = [
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
            if (DataImporter.unsupportedEntry(equipment)) {
                continue;
            }

            // Replace / as it's used as a separator in GetFolderAtPath.
            const category = ImportHelper.TranslateCategory(ImportHelper.StringValue(equipment, 'category'), this.categoryTranslations).replace('/', ' ');
            let categoryFolder = await ImportHelper.GetFolderAtPath(`${Constants.ROOT_IMPORT_FOLDER_NAME}/${game.i18n.localize('SR5.Gear')}/${category}`, true);

            const item = this.GetDefaultData({type: 'equipment'});
            item.name = ImportHelper.StringValue(equipment, 'name');
            item.name = ImportHelper.MapNameToTranslation(this.itemTranslations, item.name);

            item.system.description.source = `${ImportHelper.StringValue(equipment, 'source')} ${ImportHelper.MapNameToPageSource(this.itemTranslations, ImportHelper.StringValue(equipment, 'name'), ImportHelper.StringValue(equipment, 'page'))}`;
            item.system.technology.rating = ImportHelper.IntValue(equipment, 'rating', 0);
            item.system.technology.availability = ImportHelper.StringValue(equipment, 'avail');
            item.system.technology.cost = ImportHelper.IntValue(equipment, 'cost', 0);

            //@ts-ignore
            item.folder = categoryFolder.id;

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