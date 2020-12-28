import {DataImporter} from "./DataImporter";
import {ImportHelper} from "../helper/ImportHelper";
import {Constants} from "./Constants";

export class DeviceImporter extends DataImporter {
    public files = ['gear.xml'];

    CanParse(jsonObject: object): boolean {
        return jsonObject.hasOwnProperty('gears') && jsonObject['gears'].hasOwnProperty('gear');
    }

    GetDefaultData() {
        return {
            name: '',
            _id: '',
            folder: null,
            img: 'icons/svg/mystery-man.svg',
            flags: {},
            type: 'device',
            data: {
                description: {
                    value: '',
                    chat: '',
                    source: '',
                },
                technology: {
                    rating: 1,
                    availability: '',
                    quantity: 1,
                    cost: 0,
                    equipped: true,
                    conceal: {
                        base: 0,
                        value: 0,
                        mod: [],
                    },
                    condition_monitor: {
                        label: '',
                        value: 0,
                        max: 0,
                    },
                },
                category: 'commlink',
                "atts": {
                    "att1": {
                        "value": 0,
                        "att": "attack"
                    },
                    "att2": {
                        "value": 0,
                        "att": "sleaze"
                    },
                    "att3": {
                        "value": 0,
                        "att": "data_processing"
                    },
                    "att4": {
                        "value": 0,
                        "att": "firewall"
                    }
                },
            },
            permission: {
                default: 2,
            },
        };
    }

    // GetItemData(options) {
    //     return Item.create({...options, type: 'device'});
    // }

    ExtractTranslation(fileName?: string) {
        if (!DataImporter.jsoni18n) {
            return;
        }

        let jsonGeari18n = ImportHelper.ExtractDataFileTranslation(DataImporter.jsoni18n, this.files[0]);
        this.categoryTranslations = ImportHelper.ExtractCategoriesTranslation(jsonGeari18n);
        this.entryTranslations = ImportHelper.ExtractItemTranslation(jsonGeari18n, 'gears', 'gear');
    }

    async Parse(jsonObject: object): Promise<Entity> {

        const commlinks = jsonObject['gears']['gear'].filter(gear => ImportHelper.StringValue(gear, 'category', '') === 'Commlinks');
        const cyberdecks = jsonObject['gears']['gear'].filter(gear => ImportHelper.StringValue(gear, 'category', '') === 'Cyberdecks');
        const entries = [];

        let commlinksFolder = await ImportHelper.GetFolderAtPath(`${Constants.ROOT_IMPORT_FOLDER_NAME}/${game.i18n.localize('SR5.DeviceCatCommlink')}`, true);
        let cyberdecksFolder = await ImportHelper.GetFolderAtPath(`${Constants.ROOT_IMPORT_FOLDER_NAME}/${game.i18n.localize('SR5.DeviceCatCyberdeck')}`, true);

        for (const commlink of commlinks) {
            if (DeviceImporter.unsupportedEntry(commlink)) {
                continue;
            }
            const data = this.GetDefaultData();

            data.name = ImportHelper.StringValue(commlink, 'name');
            data.name = ImportHelper.MapNameToTranslation(this.entryTranslations, data.name);

            data.data.description.source = `${ImportHelper.StringValue(commlink, 'source')} ${ImportHelper.MapNameToPageSource(this.entryTranslations, ImportHelper.StringValue(commlink, 'name'), ImportHelper.StringValue(commlink, 'page'))}`;
            data.data.technology.rating = ImportHelper.IntValue(commlink, 'devicerating', 0);
            data.data.technology.availability = ImportHelper.StringValue(commlink, 'avail');
            data.data.technology.cost = ImportHelper.IntValue(commlink, 'cost', 0);
            data.data.atts.att3.value = ImportHelper.IntValue(commlink, 'dataprocessing', 0);
            data.data.atts.att4.value = ImportHelper.IntValue(commlink, 'firewall', 0);

            //@ts-ignore
            data.folder = commlinksFolder.id;
            //@ts-ignore
            entries.push(data);
        }

        for (const cyberdeck of cyberdecks) {
            if (DeviceImporter.unsupportedEntry(cyberdeck)) {
                continue;
            }

            const data = this.GetDefaultData();

            data.data.category = 'cyberdeck';
            data.name = ImportHelper.StringValue(cyberdeck, 'name');
            data.name = ImportHelper.MapNameToTranslation(this.entryTranslations, data.name);

            data.data.description.source = `${ImportHelper.StringValue(cyberdeck, 'source')} ${ImportHelper.MapNameToPageSource(this.entryTranslations, ImportHelper.StringValue(cyberdeck, 'name'), ImportHelper.StringValue(cyberdeck, 'page'))}`;
            data.data.technology.rating = ImportHelper.IntValue(cyberdeck, 'devicerating', 0);
            data.data.technology.availability = ImportHelper.StringValue(cyberdeck, 'avail');
            data.data.technology.cost = ImportHelper.IntValue(cyberdeck, 'cost', 0);

            // Some cyberdecks have a flexible attribute order
            // attributearray is a ',' separated list of values. Since it's hacky, be very unforgiving.
            if (cyberdeck.hasOwnProperty('attributearray')) {
                const attributeOrder = ImportHelper.StringValue(cyberdeck, 'attributearray').split(',');
                const att1 = Number(attributeOrder[0]);
                const att2 = Number(attributeOrder[1]);
                const att3 = Number(attributeOrder[2]);
                const att4 = Number(attributeOrder[3]);
                data.data.atts.att1.value = att1;
                data.data.atts.att2.value = att2;
                data.data.atts.att3.value = att3;
                data.data.atts.att4.value = att4;

            // Some cyberdecks have a fixed attribute order
            } else if (cyberdeck.hasOwnProperty('attack')) {
                data.data.atts.att1.value = ImportHelper.IntValue(cyberdeck, 'attack', 0);
                data.data.atts.att2.value = ImportHelper.IntValue(cyberdeck, 'sleaze', 0);
                data.data.atts.att3.value = ImportHelper.IntValue(cyberdeck, 'dataprocessing', 0);
                data.data.atts.att4.value = ImportHelper.IntValue(cyberdeck, 'firewall', 0);
            }

            //@ts-ignore
            data.folder = cyberdecksFolder.id;
            //@ts-ignore
            entries.push(data);
        }


        return await Item.create(entries)
    }

    /* List of unsupported Commlinks, due to dynamics value calculations.
     */
    static unsupportedEntry(jsonData): boolean {
        if (super.unsupportedEntry(jsonData)) {
            return true;
        }

        const unsupportedIds = [
            'd63eb841-7b15-4539-9026-b90a4924aeeb',  // Dynamic rating value.
        ];
        return unsupportedIds.includes(ImportHelper.StringValue(jsonData, 'id'));
    }
}