import { DataImporter } from './DataImporter';
import Mod = Shadowrun.Modification;
import { ImportHelper } from '../helper/ImportHelper';
import { Constants } from './Constants';
import { ModParserBase } from '../parser/mod/ModParserBase';

export class ModImporter extends DataImporter {
    public categoryTranslations: any;
    public accessoryTranslations: any;
    public file: string = 'weapons.xml';

    CanParse(jsonObject: object): boolean {
        return jsonObject.hasOwnProperty('accessories') && jsonObject['accessories'].hasOwnProperty('accessory');
    }

    GetDefaultData(): Mod {
        return {
            name: '',
            _id: '',
            folder: null,
            img: 'icons/svg/mystery-man.svg',
            flags: {},
            type: 'modification',
            data: {
                description: {
                    value: '',
                    chat: '',
                    source: '',
                },
                technology: {
                    rating: 1,
                    availability: '',
                    quantity: 1,
                    cost: 0,
                    equipped: true,
                    conceal: {
                        base: 0,
                        value: 0,
                        mod: [],
                    },
                    condition_monitor: {
                        label: '',
                        value: 0,
                        max: 0,
                    },
                },
                type: '',
                mount_point: '',
                dice_pool: 0,
                accuracy: 0,
                rc: 0,
            },
            permission: {
                default: 2,
            },
        };
    }

    ExtractTranslation() {
        if (!DataImporter.jsoni18n) {
            return;
        }

        let jsonWeaponsi18n = ImportHelper.ExtractDataFileTranslation(DataImporter.jsoni18n, this.file);
        // Parts of weapon accessory translations are within the application translation. Currently only data translation is used.
        this.accessoryTranslations = ImportHelper.ExtractItemTranslation(jsonWeaponsi18n, 'accessories', 'accessory');
    }

    async Parse(jsonObject: object): Promise<Entity> {
        const parser = new ModParserBase();

        let datas: Mod[] = [];
        let jsonDatas = jsonObject['accessories']['accessory'];
        for (let i = 0; i < jsonDatas.length; i++) {
            let jsonData = jsonDatas[i];

            let data = parser.Parse(jsonData, this.GetDefaultData());
            // TODO: Integrate into ModParserBase approach.
            data.name = ImportHelper.MapNameToTranslation(this.accessoryTranslations, data.name);
            //TODO: Test this

            let folderName = data.data.mount_point !== undefined ? data.data.mount_point : 'Other';
            if (folderName.includes('/')) {
                let splitName = folderName.split('/');
                folderName = splitName[0];
            }

            let folder = await ImportHelper.GetFolderAtPath(`${Constants.ROOT_IMPORT_FOLDER_NAME}/Mods/${folderName}`, true);
            data.folder = folder.id;

            datas.push(data);
        }

        return await Item.create(datas);
    }
}
