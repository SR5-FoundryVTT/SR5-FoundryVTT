import { DataImporter } from './DataImporter';
import { ImportHelper } from '../helper/ImportHelper';
import { Constants } from './Constants';
import { RangedParser } from '../parser/weapon/RangedParser';
import { MeleeParser } from '../parser/weapon/MeleeParser';
import { ThrownParser } from '../parser/weapon/ThrownParser';
import { ParserMap } from '../parser/ParserMap';
import { WeaponParserBase } from '../parser/weapon/WeaponParserBase';
import { DataDefaults } from '../../../data/DataDefaults';
import WeaponItemData = Shadowrun.WeaponItemData;
import WeaponData = Shadowrun.WeaponData;
import { UpdateActionFlow } from '../../../item/flows/UpdateActionFlow';
import { WeaponsSchema } from '../schema/WeaponsSchema';

export class WeaponImporter extends DataImporter<WeaponItemData, WeaponData> {
    public override categoryTranslations: any;
    public override itemTranslations: any;
    public files = ['weapons.xml'];

    CanParse(jsonObject: object): boolean {
        return jsonObject.hasOwnProperty('weapons') && jsonObject['weapons'].hasOwnProperty('weapon');
    }

    public override GetDefaultData({ type }: { type: any; }): WeaponItemData {
        const systemData = {action: {type: 'varies', attribute: 'agility'}} as WeaponData;
        return DataDefaults.baseEntityData<WeaponItemData, WeaponData>("Item", {type}, systemData);
    }

    ExtractTranslation() {
        if (!DataImporter.jsoni18n) {
            return;
        }

        let jsonWeaponi18n = ImportHelper.ExtractDataFileTranslation(DataImporter.jsoni18n, this.files[0]);
        this.categoryTranslations = ImportHelper.ExtractCategoriesTranslation(jsonWeaponi18n);
        this.itemTranslations = ImportHelper.ExtractItemTranslation(jsonWeaponi18n, 'weapons', 'weapon');
    }

    async Parse(jsonObject: WeaponsSchema, setIcons: boolean): Promise<Item> {
        const folders = await ImportHelper.MakeCategoryFolders("Item", jsonObject, 'Weapons', this.categoryTranslations);

        folders['gear'] = await ImportHelper.GetFolderAtPath("Item", "Weapons/Gear", true);
        folders['quality'] = await ImportHelper.GetFolderAtPath("Item", "Weapons/Quality", true);

        const parser = new ParserMap<WeaponItemData>(WeaponParserBase.GetWeaponType, [
            { key: 'range', value: new RangedParser() },
            { key: 'melee', value: new MeleeParser() },
            { key: 'thrown', value: new ThrownParser() },
        ]);

        let items: WeaponItemData[] = [];
        this.iconList = await this.getIconFiles();
        const parserType = 'weapon';

        for (const jsonData of jsonObject.weapons.weapon) {

            // Check to ensure the data entry is supported and the correct category
            if (DataImporter.unsupportedEntry(jsonData)) {
                continue;
            }

            try {
                // Create the item
                let item = await parser.Parse(jsonData, this.GetDefaultData({type: parserType}), this.itemTranslations);
                // @ts-expect-error // TODO: Foundry Where is my foundry base data?
                item.folder = folders[item.system.subcategory].id;

                // Figure out item subtype
                let subType = '';
                // range/melee/thrown
                if (item.system.category) {
                    subType = this.formatAsSlug(item.system.category);
                }
                // exception for thrown weapons and explosives
                const weaponCategory = this.formatAsSlug(item.system.subcategory);
                if (!(subType && ( weaponCategory == 'gear'))) {
                    subType = weaponCategory;
                }
                // deal with explosives and their weird formatting
                if (weaponCategory == 'gear' && item.name.includes(':')) {
                    subType = this.formatAsSlug(item.name.split(':')[0]);
                }

                // Set Import Flags
                item.system.importFlags = this.genImportFlags(item.name, item.type, subType);

                // Default icon
                if (setIcons) {item.img = await this.iconAssign(item.system.importFlags, item.system, this.iconList)};

                // Add relevant action tests
                UpdateActionFlow.injectActionTestsIntoChangeData(item.type, item, item);

                items.push(item);
            } catch (error) {
                console.error("Error while parsing Weapon:", jsonData.name._TEXT ?? "Unknown");
                ui.notifications?.error("Falled Parsing Weapon:" + (jsonData.name._TEXT ?? "Unknown"));
            }
        }

        // @ts-expect-error // TODO: TYPE: This should be removed after typing of SR5Item
        return await Item.create(items, { pack: Constants.MAP_COMPENDIUM_KEY['Item'].pack });
    }
}
