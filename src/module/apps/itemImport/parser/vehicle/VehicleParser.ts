import { ItemDataSource } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/itemData';
import { Parser } from '../Parser';
import { SR5Item } from '../../../../item/SR5Item';
import { Vehicle } from '../../schema/VehiclesSchema';
import { CompendiumKey } from '../../importer/Constants';
import { TranslationHelper as TH } from '../../helper/TranslationHelper';
import { ImportHelper as IH, NotEmpty } from '../../helper/ImportHelper';
import VehicleActorData = Shadowrun.VehicleActorData;

export class VehicleParser extends Parser<VehicleActorData> {
    protected override parseType: string = 'vehicle';

    private getVehicleItems(
        vehicleName: string,
        items: SR5Item[],
        itemsData: NotEmpty<Vehicle['mods']>['mod' | 'name'] | NotEmpty<Vehicle['gears']>['gear'] | NotEmpty<Vehicle['weapons']>['weapon'],
        translationMap: Record<string, string>
    ): ItemDataSource[] {
        const itemMap = new Map(items.map(i => [i.name, i]));

        const result: ItemDataSource[] = [];

        for (const item of IH.getArray(itemsData)) {
            const name = ('name' in item ? item.name?._TEXT : item._TEXT) || '';
            const translatedName = translationMap[name] || name;
            const foundItem = itemMap.get(translatedName);

            if (!foundItem) {
                console.log(`[Vehicle Mod Missing]\nVehicle: ${vehicleName}\nMod: ${name}`);
                continue;
            }

            const itemBase = game.items!.fromCompendium(foundItem, { keepId: true }) as ItemDataSource;

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

    protected override async getItems(jsonData: Vehicle): Promise<Shadowrun.ShadowrunItemData[]> {
        const allModName = [
            ...IH.getArray(jsonData.mods?.name).map(m => m._TEXT),
            ...IH.getArray(jsonData.mods?.mod).map(m => m.name._TEXT),
        ].filter(Boolean);

        const allGearName = IH.getArray(jsonData.gears?.gear).map(v => v?._TEXT || v?.name?._TEXT || '');
        const allWeaponName = IH.getArray(jsonData.weapons?.weapon).map(w => w.name._TEXT);

        const translationMap: Record<string, string> = {};
        for (const name of allModName) translationMap[name] = TH.getTranslation(name, { type: 'mod' });
        for (const name of allGearName) translationMap[name] = TH.getTranslation(name, { type: 'gear' });
        for (const name of allWeaponName) translationMap[name] = TH.getTranslation(name, { type: 'weapon' });

        const [modItem, gearItem, weaponItem] = await Promise.all([
            IH.findItem('Vehicle_Mod', allModName.map(name => translationMap[name])),
            IH.findItem('Gear', allGearName.map(name => translationMap[name])),
            IH.findItem('Weapon', allWeaponName.map(name => translationMap[name])),
        ]);

        const name = jsonData.name._TEXT;
        return [
            ...this.getVehicleItems(name, modItem, jsonData.mods?.mod, translationMap),
            ...this.getVehicleItems(name, modItem, jsonData.mods?.name, translationMap),
            ...this.getVehicleItems(name, gearItem, jsonData.gears?.gear, translationMap),
            ...this.getVehicleItems(name, weaponItem, jsonData.weapons?.weapon, translationMap),
        ];
    }

    protected override async getFolder(jsonData: Vehicle, compendiumKey: CompendiumKey): Promise<Folder> {
        const category = jsonData.category._TEXT;
        const isDrone = category.startsWith("Drones:");
        const rootFolder = TH.getTranslation(isDrone ? "Drones" : "Vehicles");
        const folderName = TH.getTranslation(category);

        return await IH.getFolder(compendiumKey, rootFolder, folderName);
    }
}
