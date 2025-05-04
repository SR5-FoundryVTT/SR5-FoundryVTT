import { ItemDataSource } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/itemData';
import { Parser } from '../Parser';
import { SR5Item } from '../../../../item/SR5Item';
import { Vehicle } from '../../schema/VehiclesSchema';
import VehicleActorData = Shadowrun.VehicleActorData;
import { ImportHelper as IH, NotEmpty } from '../../helper/ImportHelper';

export class VehicleParser extends Parser<VehicleActorData> {
    private getItems(
        vehicleName: string,
        items: SR5Item[],
        itemsData: NotEmpty<Vehicle['mods']>['mod' | 'name'] | NotEmpty<Vehicle['gears']>['gear'] | NotEmpty<Vehicle['weapons']>['weapon'],
        jsonTranslation?: object
    ): ItemDataSource[] {
        const itemMap = new Map(items.map(i => [i.name, i]));

        const result: ItemDataSource[] = [];

        for (const item of IH.getArray(itemsData)) {
            const name = 'name' in item ? item.name?._TEXT : item._TEXT;
            const translatedName = IH.MapNameToTranslation(jsonTranslation, name);
            const foundItem = itemMap.get(translatedName);

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

    override async Parse(jsonData: Vehicle, actor: VehicleActorData, jsonTranslation?: object | undefined): Promise<VehicleActorData> {        
        // find items first to increase performance
        const mods = jsonData.mods || undefined;
        const allItemsName = [
            ...IH.getArray(mods?.name).map(item => IH.MapNameToTranslation(jsonTranslation, item._TEXT)),
            ...IH.getArray(mods?.mod).map(item => IH.MapNameToTranslation(jsonTranslation, item.name?._TEXT)),
            ...IH.getArray(jsonData.weapons?.weapon).map(item => IH.MapNameToTranslation(jsonTranslation, item.name?._TEXT)),
            ...IH.getArray(jsonData.gears?.gear).map(item => IH.MapNameToTranslation(jsonTranslation, item._TEXT ?? item.name?._TEXT)),
        ];
        const allItemsPromise = IH.findItem('Item', allItemsName);

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

        // delay item handling to give it time to find them
        const allItems = await allItemsPromise;
        //@ts-expect-error
        actor.items = [
            ...this.getItems(actor.name, allItems, mods?.mod, jsonTranslation),
            ...this.getItems(actor.name, allItems, mods?.name, jsonTranslation),
            ...this.getItems(actor.name, allItems, jsonData.gears?.gear, jsonTranslation),
            ...this.getItems(actor.name, allItems, jsonData.weapons?.weapon, jsonTranslation),
        ];

        if (jsonTranslation) {
            const origName = actor.name;
            actor.name = IH.MapNameToTranslation(jsonTranslation, origName);
            actor.system.description.source = `${jsonData.source._TEXT} ${IH.MapNameToPageSource(jsonTranslation, origName)}`;
        }

        return actor;
    }
}
