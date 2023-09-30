import { DataImporter } from './DataImporter';
import { ImportHelper } from '../helper/ImportHelper';
import { Constants } from './Constants';
import { RangedParser } from '../parser/weapon/RangedParser';
import { MeleeParser } from '../parser/weapon/MeleeParser';
import { ThrownParser } from '../parser/weapon/ThrownParser';
import { ParserMap } from '../parser/ParserMap';
import { WeaponParserBase } from '../parser/weapon/WeaponParserBase';
import WeaponItemData = Shadowrun.WeaponItemData;
import {Helpers} from "../../helpers";
import { DataDefaults } from '../../data/DataDefaults';
import { SR5 } from "../../config";

export class WeaponImporter extends DataImporter<WeaponItemData, Shadowrun.WeaponData> {
    public override categoryTranslations: any;
    public override itemTranslations: any;
    public files = ['weapons.xml'];

    CanParse(jsonObject: object): boolean {
        return jsonObject.hasOwnProperty('weapons') && jsonObject['weapons'].hasOwnProperty('weapon');
    }

    public override GetDefaultData({ type }: { type: any; }): WeaponItemData {
        const systemData = {action: {type: 'varies', attribute: 'agility'}} as Shadowrun.WeaponData;
        return DataDefaults.baseItemData<Shadowrun.WeaponItemData, Shadowrun.WeaponData>({type}, systemData);
    }

    ExtractTranslation() {
        if (!DataImporter.jsoni18n) {
            return;
        }

        let jsonWeaponi18n = ImportHelper.ExtractDataFileTranslation(DataImporter.jsoni18n, this.files[0]);
        this.categoryTranslations = ImportHelper.ExtractCategoriesTranslation(jsonWeaponi18n);
        this.itemTranslations = ImportHelper.ExtractItemTranslation(jsonWeaponi18n, 'weapons', 'weapon');
    }

    async Parse(jsonObject: object, setIcons: boolean): Promise<Item> {
        const folders = await ImportHelper.MakeCategoryFolders(jsonObject, 'Weapons', this.categoryTranslations);

        folders['gear'] = await ImportHelper.GetFolderAtPath(`${Constants.ROOT_IMPORT_FOLDER_NAME}/Weapons/Gear`, true);
        folders['quality'] = await ImportHelper.GetFolderAtPath(`${Constants.ROOT_IMPORT_FOLDER_NAME}/Weapons/Quality`, true);

        const parser = new ParserMap<WeaponItemData>(WeaponParserBase.GetWeaponType, [
            { key: 'range', value: new RangedParser() },
            { key: 'melee', value: new MeleeParser() },
            { key: 'thrown', value: new ThrownParser() },
        ]);

        let items: WeaponItemData[] = [];
        let jsonDatas = jsonObject['weapons']['weapon'];
        const parserType = 'weapon';

        for (let i = 0; i < jsonDatas.length; i++) {
            let jsonData = jsonDatas[i];

            // Check to ensure the data entry is supported and the correct category
            if (DataImporter.unsupportedEntry(jsonData)) {
                continue;
            }

            // Create the item
            let item = parser.Parse(jsonData, this.GetDefaultData({type: parserType}), this.itemTranslations);
            // @ts-ignore // TODO: Foundry Where is my foundry base data?
            item.folder = folders[item.system.subcategory].id;

            // Import Flags
            item.system.importFlags = this.genImportFlags(item.name, item.type);

            let subType = '';
            if (item.system.category) {
                subType = this.formatSubtypeName(item.system.category);
            }
            if (item.system.subcategory) {
                subType = this.formatSubtypeName(item.system.subcategory);
            }
            if (Object.keys(SR5.itemSubTypeIconOverrides[parserType]).includes(subType)) {
                item.system.importFlags.subType = subType;
            }

            // Default icon
            if (setIcons) item.img = await this.iconAssign(item.system.importFlags, item.system);

            // Add relevant action tests
            Helpers.injectActionTestsIntoChangeData(item.type, item, item);

            items.push(item);
        }

        // @ts-ignore // TODO: TYPE: This should be removed after typing of SR5Item
        return await Item.create(items);
    }
}
