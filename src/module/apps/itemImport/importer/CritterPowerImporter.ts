import { DataImporter } from './DataImporter';
import { ImportHelper } from '../helper/ImportHelper';
import { CritterPowerParserBase } from '../parser/critter-power/CritterPowerParserBase';
import { Constants } from './Constants';
import { UpdateActionFlow } from '../../../item/flows/UpdateActionFlow';

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


    async Parse(chummerPowers: object, setIcons: boolean): Promise<Item> {
        const parser = new CritterPowerParserBase();
        const folder = await ImportHelper.GetFolderAtPath(`${Constants.ROOT_IMPORT_FOLDER_NAME}/${game.i18n.localize('TYPES.Item.critter_power')}`, true);
        const items: Shadowrun.CritterPowerItemData[] = [];
        const chummerCritterPowers = this.filterObjects(chummerPowers['powers']['power']);
        this.iconList = await this.getIconFiles();
        const parserType = 'critter_power';

        for (const chummerCritterPower of chummerCritterPowers) {

            // Check to ensure the data entry is supported
            if (DataImporter.unsupportedEntry(chummerCritterPower)) {
                continue;
            }

            // Create the item
            const item = parser.Parse(chummerCritterPower, this.GetDefaultData({type: parserType}), this.itemTranslations);
            // @ts-expect-error TODO: foundry-vtt-type v10
            item.folder = folder.id;

            // Import Flags
            item.system.importFlags = this.genImportFlags(item.name, item.type, item.system.powerType);

            // Default icon
            if (setIcons) {item.img = await this.iconAssign(item.system.importFlags, item.system, this.iconList)};

            // Translate name if needed
            item.name = ImportHelper.MapNameToTranslation(this.itemTranslations, item.name);

            // Add relevant action tests
            UpdateActionFlow.injectActionTestsIntoChangeData(item.type, item, item);

            items.push(item);
        }

        // @ts-expect-error // TODO: TYPE: Remove this.
        return await Item.create(items);
    }
}
