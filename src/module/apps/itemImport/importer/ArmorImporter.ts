import { Constants } from './Constants';
import { DataImporter } from './DataImporter';
import { ImportHelper } from '../helper/ImportHelper';
import { ArmorParserBase } from '../parser/armor/ArmorParserBase';
import { UpdateActionFlow } from '../../../item/flows/UpdateActionFlow';
import { ArmorSchema } from '../schema/ArmorSchema';

export class ArmorImporter extends DataImporter<Shadowrun.ArmorItemData, Shadowrun.ArmorData> {
    public armorTranslations: any;
    public override categoryTranslations: any;
    public files = ['armor.xml'];

    CanParse(jsonObject: object): boolean {
        return jsonObject.hasOwnProperty('armors') && jsonObject['armors'].hasOwnProperty('armor');
    }

    ExtractTranslation() {
        if (!DataImporter.jsoni18n) {
            return;
        }

        let jsonArmori18n = ImportHelper.ExtractDataFileTranslation(DataImporter.jsoni18n, this.files[0]);
        this.categoryTranslations = ImportHelper.ExtractCategoriesTranslation(jsonArmori18n);
        this.armorTranslations = ImportHelper.ExtractItemTranslation(jsonArmori18n, 'armors', 'armor');
    }

    async Parse(jsonObject: ArmorSchema, setIcons: boolean): Promise<Item> {
        const folders = await ImportHelper.MakeCategoryFolders("Item", jsonObject, 'Armor', this.categoryTranslations);
        const parser = new ArmorParserBase();
        let datas: Shadowrun.ArmorItemData[] = [];
        this.iconList = await this.getIconFiles();
        const parserType = 'armor';

        for (const jsonData of jsonObject.armors.armor) {
            // Check to ensure the data entry is supported and the correct category
            if (DataImporter.unsupportedEntry(jsonData)) {
                continue;
            }

            try {
                // Create the item
                let item = await parser.Parse(jsonData, this.GetDefaultData({type: parserType, entityType: "Item"}));

                const category = jsonData.category._TEXT.toLowerCase();
                // @ts-expect-error TODO: Foundry Where is my foundry base data?
                item.folder = folders[category].id;

                // Import Flags
                item.system.importFlags = this.genImportFlags(item.name, item.type, this.formatAsSlug(category));
                if (setIcons) {item.img = await this.iconAssign(item.system.importFlags, item.system, this.iconList)};

                // Translate the name
                item.name = ImportHelper.MapNameToTranslation(this.armorTranslations, item.name);

                // Add relevant action tests
                UpdateActionFlow.injectActionTestsIntoChangeData(item.type, item, item);

                datas.push(item);
            } catch (error) {
                ui.notifications?.error("Failed Parsing Armor:" + (jsonData.name._TEXT ?? "Unknown"));
            }
        }

        // @ts-expect-error
        return await Item.create(datas, { pack: Constants.MAP_COMPENDIUM_KEY['Item'].pack }) as Item;
    }
}
