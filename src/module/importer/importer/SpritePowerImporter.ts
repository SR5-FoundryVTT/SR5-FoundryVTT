import { SpritePowerParser } from './../parser/critter-power/SpritePowerParser';
import { Helpers } from "../../helpers";
import { ImportHelper } from "../helper/ImportHelper";
import { Constants } from "./Constants";
import { DataImporter } from "./DataImporter";


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
    public CanParse(jsonObject: object): boolean {
        return jsonObject.hasOwnProperty('powers') && jsonObject['powers'].hasOwnProperty('power');
    }

    public async Parse(chummerData: object): Promise<Item> {
        const parser = new SpritePowerParser();
        const folder = await ImportHelper.GetFolderAtPath(`${Constants.ROOT_IMPORT_FOLDER_NAME}/${game.i18n.localize('ITEM.TypeSprite_power')}`, true);

        const items: Shadowrun.SpritePowerItemData[] = [];
        const chummerSpritePowers = this.filterObjects(chummerData['powers']['power']);

        for (const chummerSpritePower of chummerSpritePowers) {
            let item = parser.Parse(chummerSpritePower, this.GetDefaultData({type: 'sprite_power'}), this.itemTranslations);

            // @ts-ignore TODO: foundry-vtt-type v10
            item.folder = folder.id;
            item.name = ImportHelper.MapNameToTranslation(this.itemTranslations, item.name);

            Helpers.injectActionTestsIntoChangeData(item.type, item, item);

            // TODO: Move this to a more general base class
            item.img = this.iconAssign(item.type, item.name, item.system);

            items.push(item);
        }

        // @ts-ignore // TODO: TYPE: Remove this.
        return await Item.create(items);
    }
}