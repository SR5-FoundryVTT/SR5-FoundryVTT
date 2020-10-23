import { DataImporter } from './DataImporter';
import { ImportHelper } from '../helper/ImportHelper';
import { Constants } from './Constants';
import Ammo = Shadowrun.Ammo;

export class AmmoImporter extends DataImporter {
    public categoryTranslations: any;
    public gearsTranslations: any;
    public file: string = 'gear.xml';

    CanParse(jsonObject: object): boolean {
        return jsonObject.hasOwnProperty('gears') && jsonObject['gears'].hasOwnProperty('gear');
    }

    GetDefaultData(): Ammo {
        return {
            name: '',
            _id: '',
            folder: null,
            img: 'icons/svg/mystery-man.svg',
            flags: {},
            type: 'ammo',
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

                element: '',
                ap: 0,
                damage: 0,
                damageType: 'physical',
                blast: {
                    radius: 0,
                    dropoff: 0,
                },
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

        let jsonGeari18n = ImportHelper.ExtractDataFileTranslation(DataImporter.jsoni18n, this.file);
        this.categoryTranslations = ImportHelper.ExtractCategoriesTranslation(jsonGeari18n);
        this.gearsTranslations = ImportHelper.ExtractItemTranslation(jsonGeari18n, 'gears', 'gear');
    }

    async Parse(jsonObject: object): Promise<Entity> {
        let ammoDatas: Ammo[] = [];
        let jsonAmmos = jsonObject['gears']['gear'];
        for (let i = 0; i < jsonAmmos.length; i++) {
            let jsonData = jsonAmmos[i];

            if (ImportHelper.StringValue(jsonData, 'category', '') !== 'Ammunition') {
                continue;
            }

            let data = this.GetDefaultData();
            data.name = ImportHelper.StringValue(jsonData, 'name');
            data.name = ImportHelper.MapNameToTranslation(this.gearsTranslations, data.name);

            data.data.description.source = `${ImportHelper.StringValue(jsonData, 'source')} ${ImportHelper.StringValue(jsonData, 'page')}`;
            data.data.technology.rating = 2;
            data.data.technology.availability = ImportHelper.StringValue(jsonData, 'avail');
            data.data.technology.cost = ImportHelper.IntValue(jsonData, 'cost', 0);

            let bonusData = ImportHelper.ObjectValue(jsonData, 'weaponbonus', null);
            if (bonusData !== undefined && bonusData !== null) {
                data.data.ap = ImportHelper.IntValue(bonusData, 'ap', 0);
                data.data.damage = ImportHelper.IntValue(bonusData, 'damage', 0);

                let damageType = ImportHelper.StringValue(bonusData, 'damagetype', '');
                if (damageType.length > 0) {
                    if (damageType.includes('P')) {
                        data.data.damageType = 'physical';
                    } else if (damageType.includes('S')) {
                        data.data.damageType = 'stun';
                    } else if (damageType.includes('M')) {
                        data.data.damageType = 'matrix';
                    }
                }
            }

            let shouldLookForWeapons = false;
            let nameLower = data.name.toLowerCase();
            ['grenade', 'rocket', 'missile'].forEach((compare) => {
                shouldLookForWeapons = shouldLookForWeapons || nameLower.includes(compare);
            });
            // NOTE: Should either weapons or gear not have been imported with translation, this will fail.
            if (shouldLookForWeapons) {
                let foundWeapon = ImportHelper.findItem((item) => {
                    return item.name.toLowerCase() === nameLower;
                });

                if (foundWeapon !== null) {
                    console.log(foundWeapon);
                    data.data.damage = foundWeapon.data.data.action.damage.value;
                    data.data.ap = foundWeapon.data.data.action.damage.ap.value;
                }
            }

            // ammo doesn't have conceal rating from looking at the data
            // data.data.technology.conceal.base = ImportHelper.intValue(jsonData, "conceal");
            data.data.technology.conceal.base = 0;

            ammoDatas.push(data);
        }

        for (let i = 0; i < ammoDatas.length; i++) {
            let folderName = 'Misc';
            let ammo = ammoDatas[i];

            let splitName = ammo.name.split(':');
            if (splitName.length > 1) {
                folderName = splitName[0].trim();
            }

            let folder = await ImportHelper.GetFolderAtPath(`${Constants.ROOT_IMPORT_FOLDER_NAME}/Ammo/${folderName}`, true);

            ammo.folder = folder.id;
        }

        return await Item.create(ammoDatas);
    }
}
