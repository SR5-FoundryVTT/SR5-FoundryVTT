import {DataImporter} from "./DataImporter";
import {ImportHelper} from "../helper/ImportHelper";
import {Constants} from "./Constants";
import DeviceItemData = Shadowrun.DeviceItemData;
import {DefaultValues} from "../../data/DataDefaults";
import {Helpers} from "../../helpers";

export class DeviceImporter extends DataImporter {
    public files = ['gear.xml'];

    CanParse(jsonObject: object): boolean {
        return jsonObject.hasOwnProperty('gears') && jsonObject['gears'].hasOwnProperty('gear');
    }

    GetDefaultData(): DeviceItemData {
        return DefaultValues.deviceItemData();
    }

    ExtractTranslation(fileName?: string) {
        if (!DataImporter.jsoni18n) {
            return;
        }

        let jsonGeari18n = ImportHelper.ExtractDataFileTranslation(DataImporter.jsoni18n, this.files[0]);
        this.categoryTranslations = ImportHelper.ExtractCategoriesTranslation(jsonGeari18n);
        this.entryTranslations = ImportHelper.ExtractItemTranslation(jsonGeari18n, 'gears', 'gear');
    }

    ParseCommlinkDevices(commlinks, folder) {
        const entries = [];

        for (const commlink of commlinks) {
            if (DataImporter.unsupportedEntry(commlink)) {
                continue;
            }
            const item = this.GetDefaultData();
            
            item.name = ImportHelper.StringValue(commlink, 'name');
            item.name = ImportHelper.MapNameToTranslation(this.entryTranslations, item.name);

            item.system.description.source = `${ImportHelper.StringValue(commlink, 'source')} ${ImportHelper.MapNameToPageSource(this.entryTranslations, ImportHelper.StringValue(commlink, 'name'), ImportHelper.StringValue(commlink, 'page'))}`;
            item.system.technology.rating = ImportHelper.IntValue(commlink, 'devicerating', 0);
            item.system.technology.availability = ImportHelper.StringValue(commlink, 'avail');
            item.system.technology.cost = ImportHelper.IntValue(commlink, 'cost', 0);
            item.system.atts.att3.value = ImportHelper.IntValue(commlink, 'dataprocessing', 0);
            item.system.atts.att4.value = ImportHelper.IntValue(commlink, 'firewall', 0);

            //@ts-ignore
            item.folder = folder.id;

            Helpers.injectActionTestsIntoChangeData(item.type, item, item);

            //@ts-ignore
            entries.push(item);
        }

        return entries;
    }

    ParseCyberdeckDevices(cyberdecks, folder) {
        const items = [];

        for (const cyberdeck of cyberdecks) {
            if (DataImporter.unsupportedEntry(cyberdeck)) {
                continue;
            }

            const item = this.GetDefaultData();

            item.system.category = 'cyberdeck';
            item.name = ImportHelper.StringValue(cyberdeck, 'name');
            item.name = ImportHelper.MapNameToTranslation(this.entryTranslations, item.name);

            item.system.description.source = `${ImportHelper.StringValue(cyberdeck, 'source')} ${ImportHelper.MapNameToPageSource(this.entryTranslations, ImportHelper.StringValue(cyberdeck, 'name'), ImportHelper.StringValue(cyberdeck, 'page'))}`;
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

            //@ts-ignore
            item.folder = folder.id;

            Helpers.injectActionTestsIntoChangeData(item.type, item, item);

            //@ts-ignore
            items.push(item);
        }

        return items;
    }

    async Parse(jsonObject: object): Promise<Item> {
        let entries = [];
        const commlinks = jsonObject['gears']['gear'].filter(gear => ImportHelper.StringValue(gear, 'category', '') === 'Commlinks');
        const cyberdecks = jsonObject['gears']['gear'].filter(gear => ImportHelper.StringValue(gear, 'category', '') === 'Cyberdecks');

        let commlinksFolder = await ImportHelper.GetFolderAtPath(`${Constants.ROOT_IMPORT_FOLDER_NAME}/${game.i18n.localize('SR5.DeviceCatCommlink')}`, true);
        let cyberdecksFolder = await ImportHelper.GetFolderAtPath(`${Constants.ROOT_IMPORT_FOLDER_NAME}/${game.i18n.localize('SR5.DeviceCatCyberdeck')}`, true);

        entries = entries.concat(this.ParseCommlinkDevices(commlinks, commlinksFolder));
        entries = entries.concat(this.ParseCyberdeckDevices(cyberdecks, cyberdecksFolder));

        // @ts-ignore // TODO: TYPE: Remove this.
        return await Item.create(entries)
    }

    /* List of unsupported Commlinks, due to dynamics value calculations.
     */
    static unsupportedEntry(jsonData): boolean {
        if (DataImporter.unsupportedEntry(jsonData)) {
            return true;
        }

        const unsupportedIds = [
            'd63eb841-7b15-4539-9026-b90a4924aeeb',  // Dynamic rating value.
        ];
        return unsupportedIds.includes(ImportHelper.StringValue(jsonData, 'id'));
    }
}