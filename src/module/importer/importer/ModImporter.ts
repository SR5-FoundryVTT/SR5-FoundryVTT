import { DataImporter } from './DataImporter';
import { ImportHelper } from '../helper/ImportHelper';
import { Constants } from './Constants';
import { ModParserBase } from '../parser/mod/ModParserBase';
import ModificationItemData = Shadowrun.ModificationItemData;
import {DefaultValues} from "../../data/DataDefaults";
import {Helpers} from "../../helpers";

export class ModImporter extends DataImporter {
    public categoryTranslations: any;
    public accessoryTranslations: any;
    public files = ['weapons.xml'];

    CanParse(jsonObject: object): boolean {
        return jsonObject.hasOwnProperty('accessories') && jsonObject['accessories'].hasOwnProperty('accessory');
    }

    GetDefaultData(): ModificationItemData {
        return {
            name: '',
            type: 'modification',
            system: {
                description: {
                    value: '',
                    chat: '',
                    source: '',
                },
                technology: DefaultValues.technologyData({rating: 1, equipped: true}),
                type: '',
                mount_point: '',
                dice_pool: 0,
                accuracy: 0,
                rc: 0,
            }
        } as ModificationItemData;
    }

    ExtractTranslation() {
        if (!DataImporter.jsoni18n) {
            return;
        }

        let jsonWeaponsi18n = ImportHelper.ExtractDataFileTranslation(DataImporter.jsoni18n, this.files[0]);
        // Parts of weapon accessory translations are within the application translation. Currently only data translation is used.
        this.accessoryTranslations = ImportHelper.ExtractItemTranslation(jsonWeaponsi18n, 'accessories', 'accessory');
    }

    async Parse(jsonObject: object): Promise<Item> {
        const parser = new ModParserBase();

        let datas: ModificationItemData[] = [];
        let jsonDatas = jsonObject['accessories']['accessory'];
        for (let i = 0; i < jsonDatas.length; i++) {
            let jsonData = jsonDatas[i];

            if (DataImporter.unsupportedEntry(jsonData)) {
                continue;
            }

            let item = parser.Parse(jsonData, this.GetDefaultData());
            item.name = ImportHelper.MapNameToTranslation(this.accessoryTranslations, item.name);

            let folderName = item.system.mount_point !== undefined ? item.system.mount_point : 'Other';
            if (folderName.includes('/')) {
                let splitName = folderName.split('/');
                folderName = splitName[0];
            }

            let folder = await ImportHelper.GetFolderAtPath(`${Constants.ROOT_IMPORT_FOLDER_NAME}/Mods/${folderName}`, true);
            //@ts-ignore TODO: Foundry Where is my foundry base data?
            item.folder = folder.id;

            Helpers.injectActionTestsIntoChangeData(item.type, item, item);

            datas.push(item);
        }

        // @ts-ignore // TODO: TYPE: Remove this.
        return await Item.create(datas);
    }
}
