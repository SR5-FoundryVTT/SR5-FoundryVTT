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

    async Parse(jsonObject: object): Promise<Item> {
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
        for (let i = 0; i < jsonDatas.length; i++) {
            let jsonData = jsonDatas[i];

            if (DataImporter.unsupportedEntry(jsonData)) {
                continue;
            }

            let item = parser.Parse(jsonData, this.GetDefaultData({type: 'weapon'}), this.itemTranslations);
            
            // @ts-ignore // TODO: Foundry Where is my foundry base data?
            item.folder = folders[item.system.subcategory].id;

            Helpers.injectActionTestsIntoChangeData(item.type, item, item);

            // TODO: Move this to a more general base class
            item.img = this.iconAssign(item.type, item.name, item.system);

            items.push(item);
        }

        // @ts-ignore // TODO: TYPE: This should be removed after typing of SR5Item
        return await Item.create(items);
    }
}
