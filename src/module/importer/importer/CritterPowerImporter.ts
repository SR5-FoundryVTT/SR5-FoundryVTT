import {DataImporter} from './DataImporter';
import {ImportHelper} from '../helper/ImportHelper';
import {CritterPowerParserBase} from '../parser/critter-power/CritterPowerParserBase';
import {Constants} from './Constants';
import {Helpers} from "../../helpers";

export class CritterPowerImporter extends DataImporter<Shadowrun.CritterPowerItemData> {
    public files = ['critterpowers.xml'];

    public unsupportedCategories = [
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


    async Parse(chummerPowers: object): Promise<Item> {
        const parser = new CritterPowerParserBase();
        const folder = await ImportHelper.GetFolderAtPath(`${Constants.ROOT_IMPORT_FOLDER_NAME}/${game.i18n.localize('ITEM.TypeCritter_power')}`, true);

        const items: Shadowrun.CritterPowerItemData[] = [];
        const chummerCritterPowers = this.filterObjects(chummerPowers['powers']['power']);

        for (const chummerCritterPower of chummerCritterPowers) {
            let item = parser.Parse(chummerCritterPower, this.GetDefaultData({type: 'critter_power'}), this.itemTranslations);

            // @ts-ignore TODO: foundry-vtt-type v10
            item.folder = folder.id;
            item.name = ImportHelper.MapNameToTranslation(this.itemTranslations, item.name);

            Helpers.injectActionTestsIntoChangeData(item.type, item, item);

            items.push(item);
        }

        // @ts-ignore // TODO: TYPE: Remove this.
        return await Item.create(items);
    }
}
