import {DataImporter} from "./DataImporter";
import {ImportHelper} from "../helper/ImportHelper";
import {Constants} from "./Constants";
import EquipmentItemData = Shadowrun.EquipmentItemData;

export class EquipmentImporter extends DataImporter {
    public files = ['gear.xml'];

    CanParse(jsonObject: object): boolean {
        return jsonObject.hasOwnProperty('gears') && jsonObject['gears'].hasOwnProperty('gear');
    }

    GetDefaultData(): EquipmentItemData {
        return {
            name: '',
            type: 'equipment',
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
                    wireless: true
                }
            },
        };
    }

    ExtractTranslation(fileName?: string) {
        if (!DataImporter.jsoni18n) {
            return;
        }

        let jsonGeari18n = ImportHelper.ExtractDataFileTranslation(DataImporter.jsoni18n, this.files[0]);
        this.categoryTranslations = ImportHelper.ExtractCategoriesTranslation(jsonGeari18n);
        this.entryTranslations = ImportHelper.ExtractItemTranslation(jsonGeari18n, 'gears', 'gear');
    }

    async ParseEquipments(equipments) {
        const entries = [];

        for (const equipment of equipments) {
            if (DataImporter.unsupportedEntry(equipment)) {
                continue;
            }

            // Replace / as it's used as a separator in GetFolderAtPath.
            const category = ImportHelper.TranslateCategory(ImportHelper.StringValue(equipment, 'category'), this.categoryTranslations).replace('/', ' ');
            let categoryFolder = await ImportHelper.GetFolderAtPath(`${Constants.ROOT_IMPORT_FOLDER_NAME}/${game.i18n.localize('SR5.Gear')}/${category}`, true);

            const data = this.GetDefaultData();
            data.name = ImportHelper.StringValue(equipment, 'name');
            data.name = ImportHelper.MapNameToTranslation(this.entryTranslations, data.name);

            data.data.description.source = `${ImportHelper.StringValue(equipment, 'source')} ${ImportHelper.MapNameToPageSource(this.entryTranslations, ImportHelper.StringValue(equipment, 'name'), ImportHelper.StringValue(equipment, 'page'))}`;
            data.data.technology.rating = ImportHelper.IntValue(equipment, 'rating', 0);
            data.data.technology.availability = ImportHelper.StringValue(equipment, 'avail');
            data.data.technology.cost = ImportHelper.IntValue(equipment, 'cost', 0);

            //@ts-ignore
            data.folder = categoryFolder.id;
            //@ts-ignore
            entries.push(data);
        }

        return entries;
    }

    FilterJsonObjects(jsonObject) {
        const unsupportedCategories = [
            'Ammunition',
            'Commlinks',
            'Cyberdecks',
            'Hacking Programs',
            'Rigger Command Consoles',
            'Custom'
        ]

        return jsonObject['gears']['gear'].filter(gear => !unsupportedCategories.includes(ImportHelper.StringValue(gear, 'category', '')));
    }

    async Parse(jsonObject: object): Promise<Item> {
        const equipments = this.FilterJsonObjects(jsonObject);

        const entries = await this.ParseEquipments(equipments);

        // @ts-ignore // TODO: TYPE: Remove this.
        return await Item.create(entries);
    }
}