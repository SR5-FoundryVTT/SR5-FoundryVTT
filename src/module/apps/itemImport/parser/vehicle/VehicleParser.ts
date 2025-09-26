import { Parser } from '../Parser';
import { Vehicle } from '../../schema/VehiclesSchema';
import { CompendiumKey } from '../../importer/Constants';
import { ImportHelper as IH, NotEmpty, RetrievedItem } from '../../helper/ImportHelper';

export class VehicleParser extends Parser<'vehicle'> {
    protected readonly parseType = 'vehicle';

    private getVehicleItems(
        vehicleName: string,
        items: RetrievedItem[],
        itemsData: NotEmpty<Vehicle['mods']>['mod' | 'name'] | NotEmpty<Vehicle['gears']>['gear'] | NotEmpty<Vehicle['weapons']>['weapon'],
    ): Item.Source[] {
        const itemMap = new Map(items.map(({name_english, ...i}) => [name_english, i]));

        const result: Item.Source[] = [];
        for (const itemData of IH.getArray(itemsData)) {
            const name = ('name' in itemData ? itemData.name?._TEXT : itemData._TEXT) || '';
            const item = itemMap.get(name);

            if (!item) {
                console.log(`[Vehicle Mod Missing]\nVehicle: ${vehicleName}\nMod: ${name}`);
                continue;
            }

            item._id = foundry.utils.randomID();
            const system = item.system as Item.SystemOfType<'modification' | 'equipment' | 'weapon'>;

            if ('technology' in system)
                system.technology.equipped = true;

            if ('$' in itemData && itemData.$?.select)
                item.name += ` (${itemData.$.select})`;

            if ('$' in itemData && itemData.$?.rating) {
                const rating = Number(itemData.$.rating) || 0;
                // probably, it does not exist `system.rating` for any item
                if ('rating' in system)
                    system.rating = rating;
                else if ('technology' in system)
                    system.technology.rating = rating;
            }

            result.push(item);
        }

        return result;
    }

    protected override getSystem(jsonData: Vehicle) {
        const system = this.getBaseSystem();
    
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
        system.attributes.body.base = Number(jsonData.body._TEXT) || 0;
        system.armor.base = Number(jsonData.armor._TEXT) || 0;
        system.isDrone = jsonData.category._TEXT.includes("Drone") || false;

        const category = jsonData.category._TEXT.toLowerCase();
        system.vehicleType = /drone|hovercraft/.test(category) ? "exotic"    :
                             /boats|submarines/.test(category) ? "water"     :
                             category.includes('craft')        ? "air"       :
                             category.includes('vtol')         ? "aerospace" : "ground";

        return system;
    }

    protected override async getItems(jsonData: Vehicle): Promise<Item.Source[]> {
        const allModName = [
            ...IH.getArray(jsonData.mods?.name).map(m => m._TEXT),
            ...IH.getArray(jsonData.mods?.mod).map(m => m.name._TEXT),
        ].filter(Boolean);

        const allGearName = IH.getArray(jsonData.gears?.gear).map(v => v?._TEXT || v?.name?._TEXT || '');
        const allWeaponName = IH.getArray(jsonData.weapons?.weapon).map(w => w.name._TEXT);

        const modItem = await IH.findItems('Vehicle_Mod', allModName);
        const gearItem = await IH.findItems('Gear', allGearName);
        const weaponItem = await IH.findItems('Weapon', allWeaponName);

        const name = jsonData.name._TEXT;
        return [
            ...this.getVehicleItems(name, modItem, jsonData.mods?.mod),
            ...this.getVehicleItems(name, modItem, jsonData.mods?.name),
            ...this.getVehicleItems(name, gearItem, jsonData.gears?.gear),
            ...this.getVehicleItems(name, weaponItem, jsonData.weapons?.weapon),
        ];
    }

    protected override async getFolder(jsonData: Vehicle, compendiumKey: CompendiumKey): Promise<Folder> {
        const category = jsonData.category._TEXT;
        const isDrone = category.startsWith("Drones:");
        const rootFolder = isDrone ? "Drones" : "Vehicles";
        const folderName = IH.getTranslatedCategory('vehicles', category);

        return IH.getFolder(compendiumKey, rootFolder, folderName);
    }
}
