import { DataImporter } from './DataImporter';
import { ImportHelper } from '../helper/ImportHelper';
import { Constants } from './Constants';
import { UpdateActionFlow } from '../../../item/flows/UpdateActionFlow';

export class AmmoImporter extends DataImporter<Shadowrun.AmmoItemData, Shadowrun.AmmoData> {
    public files = ['gear.xml'];

    CanParse(jsonObject: object): boolean {
        return jsonObject.hasOwnProperty('gears') && jsonObject['gears'].hasOwnProperty('gear');
    }

    ExtractTranslation() {
        if (!DataImporter.jsoni18n) {
            return;
        }

        const jsonGeari18n = ImportHelper.ExtractDataFileTranslation(DataImporter.jsoni18n, this.files[0]);
        this.categoryTranslations = ImportHelper.ExtractCategoriesTranslation(jsonGeari18n);
        this.itemTranslations = ImportHelper.ExtractItemTranslation(jsonGeari18n, 'gears', 'gear');
    }

    async Parse(jsonObject: object, setIcons: boolean): Promise<Item> {
        const ammoDatas: Shadowrun.AmmoItemData[] = [];
        const jsonAmmos = jsonObject['gears']['gear'];
        this.iconList = await this.getIconFiles();
        const parserType = 'ammo';

        for (let i = 0; i < jsonAmmos.length; i++) {
            const jsonData = jsonAmmos[i];

            // Check to ensure the data entry is supported and the correct category
            if (DataImporter.unsupportedEntry(jsonData)) {
                continue;
            }
            if (ImportHelper.StringValue(jsonData, 'category', '') !== 'Ammunition') {
                continue;
            }

            // Create the item
            const item = this.GetDefaultData({type: parserType});
            item.name = ImportHelper.StringValue(jsonData, 'name');

            // Import Flags
            item.system.importFlags = this.genImportFlags(item.name, item.type, this.formatAsSlug(item.name.split(':')[0]));

            // Default icon
            if (setIcons) {item.img = await this.iconAssign(item.system.importFlags, item.system, this.iconList)};

            // Parse the item information from the xml
            item.system.description.source = `${ImportHelper.StringValue(jsonData, 'source')} ${ImportHelper.StringValue(jsonData, 'page')}`;
            item.system.technology.rating = 2;
            item.system.technology.availability = ImportHelper.StringValue(jsonData, 'avail');
            item.system.technology.cost = ImportHelper.IntValue(jsonData, 'cost', 0);

            const bonusData = ImportHelper.ObjectValue(jsonData, 'weaponbonus', null);
            if (bonusData !== undefined && bonusData !== null) {
                item.system.ap = ImportHelper.IntValue(bonusData, 'ap', 0);
                item.system.damage = ImportHelper.IntValue(bonusData, 'damage', 0);

                const damageType = ImportHelper.StringValue(bonusData, 'damagetype', '');
                if (damageType.length > 0) {
                    if (damageType.includes('P')) {
                        item.system.damageType = 'physical';
                    } else if (damageType.includes('S')) {
                        item.system.damageType = 'stun';
                    } else if (damageType.includes('M')) {
                        item.system.damageType = 'matrix';
                    }
                }
            }

            // TODO: This can be improved by using the stored english name in item.system.importFlags.name
            let shouldLookForWeapons = false;
            const nameLower = item.name.toLowerCase();
            ['grenade', 'rocket', 'missile'].forEach((compare) => {
                shouldLookForWeapons = shouldLookForWeapons || nameLower.includes(compare);
            });
            // NOTE: Should either weapons or gear not have been imported with translation, this will fail.
            if (shouldLookForWeapons) {
                const foundWeapon = ImportHelper.findItem((item) => {
                    if (!item?.name) return false;
                    // Filter for weapon type due to possible double naming giving other item types.
                    return item.type === 'weapon' && item.name.toLowerCase() === nameLower;
                });

                if (foundWeapon != null && "action" in foundWeapon.system) {
                    const weaponData = foundWeapon.system as Shadowrun.WeaponData;
                    item.system.damage = weaponData.action.damage.value;
                    item.system.ap =weaponData.action.damage.ap.value;
                }
            }

            // ammo doesn't have conceal rating from looking at the data
            // system.technology.conceal.base = ImportHelper.intValue(jsonData, "conceal");
            item.system.technology.conceal.base = 0;

            // Translate Item Name
            item.name = ImportHelper.MapNameToTranslation(this.itemTranslations, item.name);

            // Add relevant action tests
            UpdateActionFlow.injectActionTestsIntoChangeData(item.type, item, item);

            ammoDatas.push(item);
        }

        for (let i = 0; i < ammoDatas.length; i++) {
            let folderName = 'Misc';
            const ammo = ammoDatas[i];

            const splitName = ammo.name.split(':');
            if (splitName.length > 1) {
                folderName = splitName[0].trim();
            }

            const folder = await ImportHelper.GetFolderAtPath(`${Constants.ROOT_IMPORT_FOLDER_NAME}/Ammo/${folderName}`, true);
            // @ts-expect-error TODO: Foundry Where is my foundry base data?
            ammo.folder = folder.id;
        }

        // @ts-expect-error // TODO: foundry-vtt-types v10
        return await Item.create(ammoDatas) as Item;
    }
}
