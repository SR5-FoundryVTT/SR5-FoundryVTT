import { ImportHelper } from '../../helper/ImportHelper';
import { ActorParserBase } from '../item/ActorParserBase';
import { getArray } from "../../../importer/actorImport/itemImporter/importHelper/BaseParserFunctions.js";
import { DataDefaults } from '../../../../data/DataDefaults';
import VehicleActorData = Shadowrun.VehicleActorData;
import { Vehicle } from '../../schema/VehiclesSchema';
import { SR5 } from '../../../../config';

export class VehicleParser extends ActorParserBase<VehicleActorData> {

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

    private createMod(item : any, jsonTranslation?: object | undefined) : any {
        const itemJson = DataDefaults.baseEntityData<Shadowrun.ModificationItemData, Shadowrun.ModificationData>(
            "Item", { type: "modification" }
        );

        const name = item._TEXT ?? item.name?._TEXT;

        itemJson.name = ImportHelper.MapNameToTranslation(jsonTranslation, name)
        itemJson.system.technology.rating = item.rating?._TEXT ?? item.$?.rating;

        itemJson.system.importFlags = this.genImportFlags(name, "modification", this.formatAsSlug("gear"));
        
        return itemJson;
    }

    private getMods(jsonData: Vehicle, jsonTranslation?: object | undefined) : any {
        const modsData = (ImportHelper.ObjectValue(jsonData, 'mods') as { name: any[] })?.name;

        const modArray = getArray(modsData).map((item: { _TEXT: any; name: { _TEXT: any; }; $: { select: string } }) => {
            let itemName = item._TEXT ?? item.name?._TEXT;

            if (itemName === "Special Equipment" && item?.$?.select)
                itemName = item.$.select;

            const translatedName = ImportHelper.MapNameToTranslation(jsonTranslation, itemName);
            const foundItem = ImportHelper.findItem(translatedName);

            if (foundItem)
                return foundItem.toObject();
            
            console.log(`Vehicle Mod ${itemName} not found on vehicle ${ImportHelper.StringValue(jsonData, 'name')}.`);

            return this.createMod(item, jsonTranslation);
        });

        return modArray;
    }

    private getGears(jsonData: Vehicle, jsonTranslation?: object | undefined) : any {
        const gearsData = (ImportHelper.ObjectValue(jsonData, 'gears') as { gear: any[] })?.gear;

        const gearArray = getArray(gearsData).map((item: any) => { return this.createMod(item, jsonTranslation); });

        return gearArray;
    }

    private getWeapons(jsonData: Vehicle, jsonTranslation?: object | undefined) : any {
        const weaponsData = (ImportHelper.ObjectValue(jsonData, 'weapons') as { weapon: any[] })?.weapon;

        const weaponArray = getArray(weaponsData).map((item: { _TEXT: any; name: { _TEXT: any; }; }) => {
            const itemName = item._TEXT ?? item.name?._TEXT;
            const translatedName = ImportHelper.MapNameToTranslation(jsonTranslation, itemName);
            const foundItem = ImportHelper.findItem(translatedName);

            if (!foundItem) {
                console.log(`Vehicle Weapon ${itemName} not found on vehicle ${ImportHelper.StringValue(jsonData, 'name')}.`);
                return null;
            }

            return foundItem.toObject();
        }).filter((item: object | null) => item !== null);

        return weaponArray;
    }
    
    override Parse(jsonData: Vehicle, actor: VehicleActorData, jsonTranslation?: object | undefined): VehicleActorData {
        actor.name = ImportHelper.StringValue(jsonData, 'name');
        actor.system.description.source = `${ImportHelper.StringValue(jsonData, 'source')} ${ImportHelper.StringValue(jsonData, 'page')}`;

        function parseSeparatedValues(value: string): { base: number; offRoad: number } {
            const [base, offRoad] = value.split("/").map(v => +v || 0);
            return { base, offRoad: offRoad ?? base };
        }

        const handlingValues = parseSeparatedValues(jsonData.handling._TEXT);
        const speedValues = parseSeparatedValues(jsonData.speed._TEXT);

        actor.system.vehicle_stats.pilot.base = +ImportHelper.StringValue(jsonData, 'pilot') || 0;
        actor.system.vehicle_stats.handling.base = handlingValues.base;
        actor.system.vehicle_stats.off_road_handling.base = handlingValues.offRoad;
        actor.system.vehicle_stats.speed.base = speedValues.base;
        actor.system.vehicle_stats.off_road_speed.base = speedValues.offRoad;
        actor.system.vehicle_stats.acceleration.base = +ImportHelper.StringValue(jsonData, 'accel') || 0;
        actor.system.vehicle_stats.sensor.base = +ImportHelper.StringValue(jsonData, 'sensor') || 0;
        actor.system.vehicle_stats.seats.base = +ImportHelper.StringValue(jsonData, 'seats', "0") || 0;
        actor.system.armor.base = +ImportHelper.StringValue(jsonData, 'armor') || 0;
        actor.system.isDrone = ImportHelper.StringValue(jsonData, 'category').includes("Drone") || false;

        const category = ImportHelper.StringValue(jsonData, 'category').toLowerCase();
        actor.system.vehicleType = /drone|hovercraft/.test(category) ? "exotic"    :
                                   /boats|submarines/.test(category) ? "water"     :
                                   category.includes('craft')        ? "air"       :
                                   category.includes('vtol')         ? "aerospace" : "ground";

        //@ts-expect-error
        actor.items = [
            ... this.getMods(jsonData, jsonTranslation),
            ... this.getGears(jsonData, jsonTranslation),
            ... this.getWeapons(jsonData, jsonTranslation)
        ];

        if (jsonTranslation) {
            const origName = ImportHelper.StringValue(jsonData, 'name');
            actor.name = ImportHelper.MapNameToTranslation(jsonTranslation, origName);
            actor.system.description.source = `${ImportHelper.StringValue(jsonData, 'source')} ${ImportHelper.MapNameToPageSource(jsonTranslation, origName)}`;
        }

        return actor;
    }
}
