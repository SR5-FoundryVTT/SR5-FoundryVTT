import { DataImporter } from "./DataImporter";
import { ImportHelper } from "../helper/ImportHelper";
import { Constants } from "./Constants";
import { UpdateActionFlow } from "../../../item/flows/UpdateActionFlow";

export class DeviceImporter extends DataImporter<Shadowrun.DeviceItemData, Shadowrun.DeviceData> {
    public files = ['gear.xml'];

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

    async ParseCommlinkDevices(commlinks, folder, setIcons) {
        const entries: Shadowrun.DeviceItemData[] = [];
        this.iconList = await this.getIconFiles();
        const parserType = 'device';

        for (const commlink of commlinks) {

            // Check to ensure the data entry is supported
            if (DataImporter.unsupportedEntry(commlink)) {
                continue;
            }

            // Create the item
            const item = this.GetDefaultData({type: parserType, entityType: "Item"});
            item.name = ImportHelper.StringValue(commlink, 'name');

            // Get the item's folder information
            // @ts-expect-error // TODO: foundry-vtt-types v10
            item.folder = folder.id;

            // Import Flags
            item.system.importFlags = this.genImportFlags(item.name, parserType, item.system.category);

            // Default icon
            if (setIcons) {item.img = await this.iconAssign(item.system.importFlags, item.system, this.iconList)};

            // Finish the importing
            item.system.description.source = `${ImportHelper.StringValue(commlink, 'source')} ${ImportHelper.MapNameToPageSource(this.itemTranslations, ImportHelper.StringValue(commlink, 'name'), ImportHelper.StringValue(commlink, 'page'))}`;
            item.system.technology.rating = ImportHelper.IntValue(commlink, 'devicerating', 0);
            item.system.technology.availability = ImportHelper.StringValue(commlink, 'avail');
            item.system.technology.cost = ImportHelper.IntValue(commlink, 'cost', 0);
            item.system.atts.att3.value = ImportHelper.IntValue(commlink, 'dataprocessing', 0);
            item.system.atts.att4.value = ImportHelper.IntValue(commlink, 'firewall', 0);

            // Translate name if needed
            item.name = ImportHelper.MapNameToTranslation(this.itemTranslations, item.name);

            // Add relevant action tests
            UpdateActionFlow.injectActionTestsIntoChangeData(item.type, item, item);

            entries.push(item);
        }

        return entries;
    }

    async ParseRCCDevices(rccs, folder, setIcons) {
        const entries: Shadowrun.DeviceItemData[] = [];
        this.iconList = await this.getIconFiles();
        const parserType = 'device';

        for (const rcc of rccs) {

            // Check to ensure the data entry is supported
            if (DataImporter.unsupportedEntry(rcc)) {
                continue;
            }

            // Create the item
            const item = this.GetDefaultData({type: parserType, entityType: "Item"});
            item.system.category = 'rcc';
            item.name = ImportHelper.StringValue(rcc, 'name');

            // Get the item's folder information
            // @ts-expect-error // TODO: foundry-vtt-types v10
            item.folder = folder.id;

            // Import Flags
            item.system.importFlags = this.genImportFlags(item.name, parserType, item.system.category);

            // Default icon
            if (setIcons) {item.img = await this.iconAssign(item.system.importFlags, item.system, this.iconList)};

            // Finish the importing
            item.system.description.source = `${ImportHelper.StringValue(rcc, 'source')} ${ImportHelper.MapNameToPageSource(this.itemTranslations, ImportHelper.StringValue(rcc, 'name'), ImportHelper.StringValue(rcc, 'page'))}`;
            item.system.technology.rating = ImportHelper.IntValue(rcc, 'devicerating', 0);
            item.system.technology.availability = ImportHelper.StringValue(rcc, 'avail');
            item.system.technology.cost = ImportHelper.IntValue(rcc, 'cost', 0);
            item.system.atts.att3.value = ImportHelper.IntValue(rcc, 'dataprocessing', 0);
            item.system.atts.att4.value = ImportHelper.IntValue(rcc, 'firewall', 0);

            // Translate name if needed
            item.name = ImportHelper.MapNameToTranslation(this.itemTranslations, item.name);

            // Add relevant action tests
            UpdateActionFlow.injectActionTestsIntoChangeData(item.type, item, item);

            entries.push(item);
        }

        return entries;
    }

    async ParseCyberdeckDevices(cyberdecks, folder, setIcons) {
        const items: Shadowrun.DeviceItemData[] = [];
        this.iconList = await this.getIconFiles();
        const parserType = 'device';

        for (const cyberdeck of cyberdecks) {

            // Check to ensure the data entry is supported
            if (DataImporter.unsupportedEntry(cyberdeck)) {
                continue;
            }

            // Create the item
            const item = this.GetDefaultData({type: parserType, entityType: "Item"});
            item.system.category = 'cyberdeck';
            item.name = ImportHelper.StringValue(cyberdeck, 'name');

            // Get the item's folder information
            // @ts-expect-error // TODO: foundry-vtt-types v10
            item.folder = folder.id;

            // Import Flags
            item.system.importFlags = this.genImportFlags(item.name, parserType, item.system.category);

            // Default icon
            if (setIcons) {item.img = await this.iconAssign(item.system.importFlags, item.system, this.iconList)};

            // Finish the importing
            item.system.description.source = `${ImportHelper.StringValue(cyberdeck, 'source')} ${ImportHelper.MapNameToPageSource(this.itemTranslations, ImportHelper.StringValue(cyberdeck, 'name'), ImportHelper.StringValue(cyberdeck, 'page'))}`;
            item.system.technology.rating = ImportHelper.IntValue(cyberdeck, 'devicerating', 0);
            item.system.technology.availability = ImportHelper.StringValue(cyberdeck, 'avail');
            item.system.technology.cost = ImportHelper.IntValue(cyberdeck, 'cost', 0);

            // Some cyberdecks have a flexible attribute order
            // attributearray is a ',' separated list of values. Since it's hacky, be very unforgiving.
            if (cyberdeck.hasOwnProperty('attributearray')) {
                const attributeOrder = ImportHelper.StringValue(cyberdeck, 'attributearray').split(',');
                const att1 = Number(attributeOrder[0]);
                const att2 = Number(attributeOrder[1]);
                const att3 = Number(attributeOrder[2]);
                const att4 = Number(attributeOrder[3]);
                item.system.atts.att1.value = att1;
                item.system.atts.att2.value = att2;
                item.system.atts.att3.value = att3;
                item.system.atts.att4.value = att4;

            // Some cyberdecks have a fixed attribute order
            } else if (cyberdeck.hasOwnProperty('attack')) {
                item.system.atts.att1.value = ImportHelper.IntValue(cyberdeck, 'attack', 0);
                item.system.atts.att2.value = ImportHelper.IntValue(cyberdeck, 'sleaze', 0);
                item.system.atts.att3.value = ImportHelper.IntValue(cyberdeck, 'dataprocessing', 0);
                item.system.atts.att4.value = ImportHelper.IntValue(cyberdeck, 'firewall', 0);
            }

            // Translate name if needed
            item.name = ImportHelper.MapNameToTranslation(this.itemTranslations, item.name);

            // Add relevant action tests
            UpdateActionFlow.injectActionTestsIntoChangeData(item.type, item, item);

            items.push(item);
        }

        return items;
    }

    async Parse(jsonObject: object, setIcons: boolean): Promise<Item> {
        let entries: Shadowrun.DeviceItemData[] = [];
        const commlinks = jsonObject['gears']['gear'].filter(gear => ImportHelper.StringValue(gear, 'category', '') === 'Commlinks');
        const cyberdecks = jsonObject['gears']['gear'].filter(gear => ImportHelper.StringValue(gear, 'category', '') === 'Cyberdecks');
        const rccs = jsonObject['gears']['gear'].filter(gear => ImportHelper.StringValue(gear, 'category', '') === 'Rigger Command Consoles');

        const commlinksFolder = await ImportHelper.GetFolderAtPath("Item", `${Constants.ROOT_IMPORT_FOLDER_NAME}/${game.i18n.localize('SR5.DeviceCatCommlink')}`, true);
        const cyberdecksFolder = await ImportHelper.GetFolderAtPath("Item", `${Constants.ROOT_IMPORT_FOLDER_NAME}/${game.i18n.localize('SR5.DeviceCatCyberdeck')}`, true);
        const rccsFolder = await ImportHelper.GetFolderAtPath("Item", `${Constants.ROOT_IMPORT_FOLDER_NAME}/${game.i18n.localize('SR5.DeviceCatRCC')}`, true);

        entries = entries.concat(await this.ParseCommlinkDevices(commlinks, commlinksFolder, setIcons));
        entries = entries.concat(await this.ParseCyberdeckDevices(cyberdecks, cyberdecksFolder, setIcons));
        entries = entries.concat(await this.ParseRCCDevices(rccs, rccsFolder, setIcons));

        // @ts-expect-error // TODO: TYPE: Remove this.
        return await Item.create(entries)
    }

    /* List of unsupported Commlinks, due to dynamics value calculations.
     */
    static override unsupportedEntry(jsonData): boolean {
        if (DataImporter.unsupportedEntry(jsonData)) {
            return true;
        }

        const unsupportedIds = [
            'd63eb841-7b15-4539-9026-b90a4924aeeb',  // Dynamic rating value.
        ];
        return unsupportedIds.includes(ImportHelper.StringValue(jsonData, 'id'));
    }
}