import { ItemDataSource } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/itemData';
import { Parser } from '../Parser';
import { SR5Item } from '../../../../item/SR5Item';
import { Vehicle } from '../../schema/VehiclesSchema';
import { TranslationHelper as TH } from '../../helper/TranslationHelper';
import { ImportHelper as IH, NotEmpty } from '../../helper/ImportHelper';
import VehicleActorData = Shadowrun.VehicleActorData;

export class VehicleParser extends Parser<VehicleActorData> {
    protected override parseType: string = 'vehicle';

    private getVehicleItems(
        vehicleName: string,
        items: SR5Item[],
        itemsData: NotEmpty<Vehicle['mods']>['mod' | 'name'] | NotEmpty<Vehicle['gears']>['gear'] | NotEmpty<Vehicle['weapons']>['weapon'],
    ): ItemDataSource[] {
        const itemMap = new Map(items.map(i => [i.name, i]));

        const result: ItemDataSource[] = [];

        for (const item of IH.getArray(itemsData)) {
            const name = 'name' in item ? item.name?._TEXT : item._TEXT;
            const foundItem = itemMap.get(name || '');

            if (!foundItem) {
                console.log(`[Vehicle Mod Missing]\nVehicle: ${vehicleName}\nMod: ${name}`);
                continue;
            }

            const itemBase = foundItem.toObject();

            if ('technology' in itemBase.system)
                itemBase.system.technology.equipped = true;

            if ('$' in item && item.$?.select)
                itemBase.name += `(${item.$.select})`;

            if ('$' in item && item.$?.rating) {
                const rating = +item.$.rating;
                if ('rating' in itemBase.system)
                    itemBase.system.rating = rating;
                else if ('technology' in itemBase.system)
                    itemBase.system.technology.rating = rating;
            }

            result.push(itemBase);
        }

        return result;
    }

    protected override getSystem(jsonData: Vehicle): VehicleActorData['system'] {    
        const system = this.getBaseSystem('Actor');
    
        function parseSeparatedValues(value: string): { base: number; offRoad: number } {
            const [base, offRoad] = value.split("/").map(v => +v || 0);
            return { base, offRoad: offRoad ?? base };
        }

        const handlingValues = parseSeparatedValues(jsonData.handling._TEXT);
        const speedValues = parseSeparatedValues(jsonData.speed._TEXT);

        system.vehicle_stats.pilot.base = +jsonData.pilot._TEXT;
        system.vehicle_stats.handling.base = handlingValues.base;
        system.vehicle_stats.off_road_handling.base = handlingValues.offRoad;
        system.vehicle_stats.speed.base = speedValues.base;
        system.vehicle_stats.off_road_speed.base = speedValues.offRoad;
        system.vehicle_stats.acceleration.base = Number(jsonData.accel._TEXT) || 0;
        system.vehicle_stats.sensor.base = Number(jsonData.sensor._TEXT) || 0;
        system.vehicle_stats.seats.base = Number(jsonData.seats?._TEXT) || 0;
        system.armor.base = Number(jsonData.armor._TEXT) || 0;
        system.isDrone = jsonData.category._TEXT.includes("Drone") || false;

        const category = jsonData.category._TEXT.toLowerCase();
        system.vehicleType = /drone|hovercraft/.test(category) ? "exotic"    :
                             /boats|submarines/.test(category) ? "water"     :
                             category.includes('craft')        ? "air"       :
                             category.includes('vtol')         ? "aerospace" : "ground";

        return system;
    }

    protected override async getItems(jsonData: Vehicle): Promise<Shadowrun.ShadowrunItemData[]> {
        // find items first to increase performance
        const mods = jsonData.mods || undefined;
        const allItemsName = [
            ...IH.getArray(mods?.name).map(item => item._TEXT),
            ...IH.getArray(mods?.mod).map(item => item.name?._TEXT),
            ...IH.getArray(jsonData.weapons?.weapon).map(item => item.name?._TEXT),
            ...IH.getArray(jsonData.gears?.gear).map(item => item._TEXT ?? item.name?._TEXT),
        ].filter(Boolean);

        const allItems = await IH.findItem('Item', allItemsName as string[]);

        const vehicleName = jsonData.name._TEXT;
        return [
            ...this.getVehicleItems(vehicleName, allItems, mods?.mod),
            ...this.getVehicleItems(vehicleName, allItems, mods?.name),
            ...this.getVehicleItems(vehicleName, allItems, jsonData.gears?.gear),
            ...this.getVehicleItems(vehicleName, allItems, jsonData.weapons?.weapon),
        ];
    }

    protected override async getFolder(jsonData: Vehicle): Promise<Folder> {
        const category = jsonData.category._TEXT;
        const isDrone = category.startsWith("Drones:");
        const rootFolder = TH.getTranslation(isDrone ? "Drones" : "Vehicles");
        const folderName = TH.getTranslation(category);

        return IH.getFolder('Drone', rootFolder, folderName);
    }
}
