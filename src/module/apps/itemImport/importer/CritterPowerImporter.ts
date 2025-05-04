import { DataImporter } from './DataImporter';
import { ImportHelper } from '../helper/ImportHelper';
import { CritterPowerParserBase } from '../parser/critter-power/CritterPowerParserBase';
import { Constants } from './Constants';
import { UpdateActionFlow } from '../../../item/flows/UpdateActionFlow';
import { CritterpowersSchema } from '../schema/CritterpowersSchema';

export class CritterPowerImporter extends DataImporter<Shadowrun.CritterPowerItemData, Shadowrun.CritterPowerData> {
    public files = ['critterpowers.xml'];

    public override unsupportedCategories = [
        'Emergent',
    ];

    CanParse(jsonObject: object): boolean {
        return jsonObject.hasOwnProperty('powers') && jsonObject['powers'].hasOwnProperty('power');
    }

    ExtractTranslation() {
        if (!DataImporter.jsoni18n) {
            return;
        }

        let jsonCritterPoweri18n = ImportHelper.ExtractDataFileTranslation(DataImporter.jsoni18n, this.files[0]);
        this.categoryTranslations = ImportHelper.ExtractCategoriesTranslation(jsonCritterPoweri18n);
        this.itemTranslations = ImportHelper.ExtractItemTranslation(jsonCritterPoweri18n, 'powers', 'power');
    }


    async Parse(chummerPowers: CritterpowersSchema, setIcons: boolean): Promise<Item> {
        const parser = new CritterPowerParserBase();

        chummerPowers['categories']['category'] = chummerPowers['categories']['category'].filter(
            (power) => !["Emergent", "Toxic Critter Powers", "Echoes"].includes(power._TEXT)
        ).concat({ _TEXT: "Other" });
        const folders = await ImportHelper.MakeCategoryFolders("Trait", chummerPowers, game.i18n.localize('TYPES.Item.critter_power'), this.categoryTranslations);

        const items: Shadowrun.CritterPowerItemData[] = [];
        this.iconList = await this.getIconFiles();
        const parserType = 'critter_power';

        for (const jsonData of chummerPowers.powers.power) {

            // Check to ensure the data entry is supported
            if (DataImporter.unsupportedEntry(jsonData)) {
                continue;
            }

            try {
                // Create the item
                const item = await parser.Parse(jsonData, this.GetDefaultData({type: parserType, entityType: "Item"}), this.itemTranslations);
                // @ts-expect-error TODO: foundry-vtt-type v10
                item.folder = folders[item.system.category]?.id || folders["other"].id;

                // Import Flags
                item.system.importFlags = this.genImportFlags(item.name, item.type, item.system.powerType);

                // Default icon
                if (setIcons) {item.img = await this.iconAssign(item.system.importFlags, item.system, this.iconList)};

                // Translate name if needed
                item.name = ImportHelper.MapNameToTranslation(this.itemTranslations, item.name);

                // Add relevant action tests
                UpdateActionFlow.injectActionTestsIntoChangeData(item.type, item, item);

                items.push(item);
            } catch (error) {
                ui.notifications?.error("Failed Parsing Armor:" + (jsonData.name._TEXT ?? "Unknown"));
            }
        }

        // @ts-expect-error // TODO: TYPE: Remove this.
        return await Item.create(items, { pack: Constants.MAP_COMPENDIUM_KEY['Trait'].pack });
    }
}
