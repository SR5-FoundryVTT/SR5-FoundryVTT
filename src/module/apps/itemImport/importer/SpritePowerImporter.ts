import { SpritePowerParser } from '../parser/critter-power/SpritePowerParser';
import { ImportHelper } from "../helper/ImportHelper";
import { Constants } from "./Constants";
import { DataImporter } from "./DataImporter";
import { UpdateActionFlow } from '../../../item/flows/UpdateActionFlow';
import { CritterpowersSchema } from '../schema/CritterpowersSchema';


/**
 * Handle importing Chummer5a sprite powers as system items
 */
export class SpritePowerImporter extends DataImporter<Shadowrun.SpritePowerItemData, Shadowrun.SpritePowerData> {
    public files = ['critterpowers.xml'];
    public override unsupportedCategories = [
        'Drake',
        'Echoes',
        'Free Spirit',
        'Infected',
        'Mundane',
        'Paranormal',
        'Paranormal/Infected',
        'Mundane/Infected',
        'Toxic Critter Powers',
        'Weakness',
        'Chimeric Modification',
        'Shapeshifter'
    ];

    /**
     * Sprite translations is included in the crittwerpowers lang section.
     */
    ExtractTranslation() {
        if (!DataImporter.jsoni18n) {
            return;
        }

        let powerI18n = ImportHelper.ExtractDataFileTranslation(DataImporter.jsoni18n, this.files[0]);
        this.categoryTranslations = ImportHelper.ExtractCategoriesTranslation(powerI18n);
        this.itemTranslations = ImportHelper.ExtractItemTranslation(powerI18n, 'powers', 'power');
    }

    /**
     * Sprite powers are included in critterpowers.xml via the category 'Emergent'
     *
     * @param jsonObject Chummer critterpower structure
     */
    public CanParse(jsonObject: CritterpowersSchema): boolean {
        return jsonObject.hasOwnProperty('powers') && jsonObject['powers'].hasOwnProperty('power');
    }

    public async Parse(chummerData: CritterpowersSchema, setIcons: boolean): Promise<Item> {
        const parser = new SpritePowerParser();
        const folder = await ImportHelper.GetFolderAtPath("Trait", `${game.i18n.localize('TYPES.Item.sprite_power')}`, true);

        const items: Shadowrun.SpritePowerItemData[] = [];
        const chummerSpritePowers = this.filterObjects(chummerData.powers.power);
        this.iconList = await this.getIconFiles();
        const parserType = 'sprite_power';

        for (const jsonData of chummerSpritePowers) {

            // Check to ensure the data entry is supported
            if (DataImporter.unsupportedEntry(jsonData)) {
                continue;
            }

            try {
                // Create the item
                let item = await parser.Parse(jsonData, this.GetDefaultData({type: parserType, entityType: "Item"}), this.itemTranslations);
                // @ts-expect-error TODO: foundry-vtt-type v10
                item.folder = folder.id;

                // Import Flags
                item.system.importFlags = this.genImportFlags(item.name, item.type, '');

                // Default icon
                if (setIcons) {item.img = await this.iconAssign(item.system.importFlags, item.system, this.iconList)};

                // Translate name if needed
                item.name = ImportHelper.MapNameToTranslation(this.itemTranslations, item.name);

                // Add relevant action tests
                UpdateActionFlow.injectActionTestsIntoChangeData(item.type, item, item);

                items.push(item);
            } catch (error) {
                ui.notifications?.error("Failed Parsing Sprite:" + (jsonData.name._TEXT ?? "Unknown"));
            }
        }

        // @ts-expect-error // TODO: TYPE: Remove this.
        return await Item.create(items, { pack: Constants.MAP_COMPENDIUM_KEY['Trait'].pack });
    }
}