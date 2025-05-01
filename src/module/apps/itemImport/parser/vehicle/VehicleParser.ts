import { ImportHelper as IH, NotEmpty } from '../../helper/ImportHelper';
import { DataDefaults } from '../../../../data/DataDefaults';
import { Parser } from '../Parser';
import VehicleActorData = Shadowrun.VehicleActorData;
import { Vehicle } from '../../schema/VehiclesSchema';
import { SR5 } from '../../../../config';
import { ItemDataSource } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/itemData';

export class VehicleParser extends Parser<VehicleActorData> {

    private formatAsSlug(name: string): string {
        return name.trim().toLowerCase().replace((/'|,|\[|\]|\(|\)/g), '').split((/-|\s|\//g)).join('-');
    }

    private genImportFlags(name: string, type: string, subType: string): Shadowrun.ImportFlagData {
        const flags = {
            name: this.formatAsSlug(name), // original english name
            type: type,
            subType: '',
            isFreshImport: true
        }
        if (subType && Object.keys(SR5.itemSubTypeIconOverrides[type]).includes(subType)) {
            flags.subType = subType;
        }
        return flags;
    }

    private createMod(item : any, jsonTranslation?: object) : any {
        const itemJson = DataDefaults.baseEntityData<Shadowrun.ModificationItemData, Shadowrun.ModificationData>(
            "Item", { type: "modification" }
        );

        const name = item._TEXT ?? item.name?._TEXT;

        itemJson.name = IH.MapNameToTranslation(jsonTranslation, name)
        itemJson.system.technology.rating = item.rating?._TEXT ?? item.$?.rating;

        itemJson.system.importFlags = this.genImportFlags(name, "modification", this.formatAsSlug("gear"));
        
        return itemJson;
    }

    private getMods(modsData: Vehicle['mods'], vehicleName: string, jsonTranslation?: object) : object[] {
        if (!modsData) return [];

        const mods = IH.getArray(modsData.mod).map(item => {
            let itemName = item.name._TEXT;

            const translatedName = IH.MapNameToTranslation(jsonTranslation, itemName);
            const foundItem = IH.findItem(translatedName);

            if (!foundItem) {
                console.log(`[Vehicle Mod Missing 1]\nVehicle: ${vehicleName}\nMod: ${itemName}`);
                return this.createMod(item, jsonTranslation);
            }

            return foundItem.toObject();
        });

        const names = IH.getArray(modsData.name).map(item => {
            let itemName = item._TEXT;

            const translatedName = IH.MapNameToTranslation(jsonTranslation, itemName);
            const foundItem = IH.findItem(translatedName);

            if (!foundItem) {
                console.log(`[Vehicle Mod Missing 2]\nVehicle: ${vehicleName}\nMod: ${itemName}`);
                return this.createMod(item, jsonTranslation);
            }

            const itemBase = foundItem.toObject();

            if (item.$?.select)
                itemBase.name += `(${item.$.select})`;

            if (item.$?.rating) {
                const rating = +item.$.rating;

                if ('rating' in itemBase.system) {
                    itemBase.system.rating = rating;
                } else if ('technology' in itemBase.system) {
                    itemBase.system.technology.rating = rating;
                }
            }

            return itemBase;
        });

        return [...names, ...mods];
    }

    private getGears(gearsData: undefined | NotEmpty<Vehicle['gears']>['gear'], jsonTranslation?: object) : any {
        return IH.getArray(gearsData).map(item => { return this.createMod(item, jsonTranslation); });
    }

    private getWeapons(weapons: undefined | NotEmpty<Vehicle['weapons']>['weapon'], vehicleName: string, jsonTranslation?: object ) : ItemDataSource[] {
        return IH.getArray(weapons).map(item => {
            const itemName = item.name?._TEXT;
            const translatedName = IH.MapNameToTranslation(jsonTranslation, itemName);
            const foundItem = IH.findItem(translatedName);

            if (!foundItem) {
                console.log(`[Vehicle Weapon Missing]\nVehicle: ${vehicleName}\nWeapon: ${itemName}`);
                return null;
            }

            return foundItem.toObject();
        }).filter((item): item is ItemDataSource => item !== null);
    }
    
    override Parse(jsonData: Vehicle, actor: VehicleActorData, jsonTranslation?: object | undefined): VehicleActorData {
        actor.name = jsonData.name._TEXT;
        actor.system.description.source = `${jsonData.source._TEXT} ${jsonData.page._TEXT}`;

        function parseSeparatedValues(value: string): { base: number; offRoad: number } {
            const [base, offRoad] = value.split("/").map(v => +v || 0);
            return { base, offRoad: offRoad ?? base };
        }

        const handlingValues = parseSeparatedValues(jsonData.handling._TEXT);
        const speedValues = parseSeparatedValues(jsonData.speed._TEXT);

        actor.system.vehicle_stats.pilot.base = +jsonData.pilot._TEXT;
        actor.system.vehicle_stats.handling.base = handlingValues.base;
        actor.system.vehicle_stats.off_road_handling.base = handlingValues.offRoad;
        actor.system.vehicle_stats.speed.base = speedValues.base;
        actor.system.vehicle_stats.off_road_speed.base = speedValues.offRoad;
        actor.system.vehicle_stats.acceleration.base = +jsonData.accel._TEXT;
        actor.system.vehicle_stats.sensor.base = +jsonData.sensor._TEXT;
        actor.system.vehicle_stats.seats.base = +(jsonData.seats?._TEXT ?? 0);
        actor.system.armor.base = +jsonData.armor._TEXT;
        actor.system.isDrone = jsonData.category._TEXT.includes("Drone") || false;

        const category = IH.StringValue(jsonData, 'category').toLowerCase();
        actor.system.vehicleType = /drone|hovercraft/.test(category) ? "exotic"    :
                                   /boats|submarines/.test(category) ? "water"     :
                                   category.includes('craft')        ? "air"       :
                                   category.includes('vtol')         ? "aerospace" : "ground";

        //@ts-expect-error
        actor.items = [
            ... this.getMods(jsonData.mods, actor.name, jsonTranslation),
            ... this.getGears(jsonData.gears?.gear, jsonTranslation),
            ... this.getWeapons(jsonData.weapons?.weapon, actor.name, jsonTranslation)
        ];

        if (jsonTranslation) {
            const origName = actor.name;
            actor.name = IH.MapNameToTranslation(jsonTranslation, origName);
            actor.system.description.source = `${jsonData.source._TEXT} ${IH.MapNameToPageSource(jsonTranslation, origName)}`;
        }

        return actor;
    }
}
