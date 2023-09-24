import { DataImporter } from './DataImporter';
import { ImportHelper } from '../helper/ImportHelper';
import { Constants } from './Constants';
import WeaponData = Shadowrun.WeaponData;
import AmmoItemData = Shadowrun.AmmoItemData;
import {Helpers} from "../../helpers";
import { SR5 } from "../../config";

export class AmmoImporter extends DataImporter<AmmoItemData, Shadowrun.AmmoData> {
    public files = ['gear.xml'];

    CanParse(jsonObject: object): boolean {
        return jsonObject.hasOwnProperty('gears') && jsonObject['gears'].hasOwnProperty('gear');
    }

    ExtractTranslation() {
        if (!DataImporter.jsoni18n) {
            return;
        }

        let jsonGeari18n = ImportHelper.ExtractDataFileTranslation(DataImporter.jsoni18n, this.files[0]);
        this.categoryTranslations = ImportHelper.ExtractCategoriesTranslation(jsonGeari18n);
        this.itemTranslations = ImportHelper.ExtractItemTranslation(jsonGeari18n, 'gears', 'gear');
    }

    async Parse(jsonObject: object): Promise<Item> {
        let ammoDatas: AmmoItemData[] = [];
        let jsonAmmos = jsonObject['gears']['gear'];

        for (let i = 0; i < jsonAmmos.length; i++) {
            let jsonData = jsonAmmos[i];

            // Check to ensure the data entry is supported and the correct category
            if (DataImporter.unsupportedEntry(jsonData)) {
                continue;
            }
            if (ImportHelper.StringValue(jsonData, 'category', '') !== 'Ammunition') {
                continue;
            }

            // Create the item
            let item = this.GetDefaultData({type: 'ammo'});
            item.name = ImportHelper.StringValue(jsonData, 'name');

            // Import Flags
            item.system.importFlags.name = foundry.utils.deepClone(item.name); // original english name for matching to icons
            item.system.importFlags.type = item.type;
            item.system.importFlags.subType = '';
            item.system.importFlags.isFreshImport = true;

            let subType = item.system.importFlags.name.split(':')[0].trim().toLowerCase().split(' ').join('-');
            if (SR5.itemSubTypes.ammo.includes(subType)) {
                item.system.importFlags.subType = subType;
            }

            // Default icon
            item.img = await this.iconAssign(item.system.importFlags, item.system);

            // Translate Item Name
            item.name = ImportHelper.MapNameToTranslation(this.itemTranslations, item.name);

            // Parse the item information from the xml
            item.system.description.source = `${ImportHelper.StringValue(jsonData, 'source')} ${ImportHelper.StringValue(jsonData, 'page')}`;
            item.system.technology.rating = 2;
            item.system.technology.availability = ImportHelper.StringValue(jsonData, 'avail');
            item.system.technology.cost = ImportHelper.IntValue(jsonData, 'cost', 0);

            let bonusData = ImportHelper.ObjectValue(jsonData, 'weaponbonus', null);
            if (bonusData !== undefined && bonusData !== null) {
                item.system.ap = ImportHelper.IntValue(bonusData, 'ap', 0);
                item.system.damage = ImportHelper.IntValue(bonusData, 'damage', 0);

                let damageType = ImportHelper.StringValue(bonusData, 'damagetype', '');
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

            let shouldLookForWeapons = false;
            let nameLower = item.name.toLowerCase();
            ['grenade', 'rocket', 'missile'].forEach((compare) => {
                shouldLookForWeapons = shouldLookForWeapons || nameLower.includes(compare);
            });
            // NOTE: Should either weapons or gear not have been imported with translation, this will fail.
            if (shouldLookForWeapons) {
                let foundWeapon = ImportHelper.findItem((item) => {
                    if (!item || !item.name) return false;
                    // Filter for weapon type due to possible double naming giving other item types.
                    return item.type === 'weapon' && item.name.toLowerCase() === nameLower;
                });

                if (foundWeapon != null && "action" in foundWeapon.data.data) {
                    const weaponData = foundWeapon.data.data as WeaponData;
                    item.system.damage = weaponData.action.damage.value;
                    item.system.ap =weaponData.action.damage.ap.value;
                }
            }

            // ammo doesn't have conceal rating from looking at the data
            // data.data.technology.conceal.base = ImportHelper.intValue(jsonData, "conceal");
            item.system.technology.conceal.base = 0;

            Helpers.injectActionTestsIntoChangeData(item.type, item, item);

            ammoDatas.push(item);
        }

        for (let i = 0; i < ammoDatas.length; i++) {
            let folderName = 'Misc';
            let ammo = ammoDatas[i];

            let splitName = ammo.name.split(':');
            if (splitName.length > 1) {
                folderName = splitName[0].trim();
            }

            let folder = await ImportHelper.GetFolderAtPath(`${Constants.ROOT_IMPORT_FOLDER_NAME}/Ammo/${folderName}`, true);
            // @ts-ignore TODO: Foundry Where is my foundry base data?
            ammo.folder = folder.id;
        }

        // @ts-ignore
        return await Item.create(ammoDatas) as Item;
    }
}
