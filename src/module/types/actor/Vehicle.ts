import { CommonData, ArmorActorData, MatrixActorData, MovementActorData, PhysicalTrackActorData, PhysicalCombatValues, CommonModifiers } from "./Common";
import { Attributes, AttributeField } from "../template/Attributes";
import { ModifiableValue } from "../template/Base";
import { ImportFlags } from "../template/ImportFlags";
import { VehicleLimits } from "../template/Limits";
const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;

const VehicleAttributes = () => ({
    ...Attributes(),
    pilot: new SchemaField(AttributeField()),
});

const VehicleStats = () => ({
    pilot: new SchemaField(AttributeField()),
    handling: new SchemaField(AttributeField()),
    off_road_handling: new SchemaField(AttributeField()),
    speed: new SchemaField(AttributeField()),
    off_road_speed: new SchemaField(AttributeField()),
    acceleration: new SchemaField(AttributeField()),
    sensor: new SchemaField(AttributeField()),
    seats: new SchemaField(AttributeField()),
});

const VehicleModCategories = () => ({
    body: new NumberField({ required: true, nullable: false, initial: 0 }),
    power_train: new NumberField({ required: true, nullable: false, initial: 0 }),
    protection: new NumberField({ required: true, nullable: false, initial: 0 }),
    electromagnetic: new NumberField({ required: true, nullable: false, initial: 0 }),
    cosmetic: new NumberField({ required: true, nullable: false, initial: 0 }),
    weapons: new NumberField({ required: true, nullable: false, initial: 0 }),
});

const VehicleData = {
    ...CommonData(),
    ...ArmorActorData(),
    ...MatrixActorData(),
    ...MovementActorData(),
    ...ImportFlags(),
    ...PhysicalTrackActorData(),
    values: new SchemaField(PhysicalCombatValues()),
    vehicleType: new StringField({
        required: true,
        initial: "ground",
        choices: ["air", "aerospace", "ground", "water", "walker", "exotic"],
    }),
    controlMode: new StringField({
        required: true,
        initial: "manual",
        choices: ["manual", "remote", "rigger", "autopilot"],
    }),
    isDrone: new BooleanField(),
    isOffRoad: new BooleanField(),
    driver: new StringField({ required: true }),
    environment: new StringField({
        required: true,
        initial: "speed",
        choices: ["speed", "handling"],
    }),
    vehicle_stats: new SchemaField(VehicleStats()),
    attributes: new SchemaField(VehicleAttributes()),
    networkController: new StringField({ required: true }),
    modifiers: new SchemaField({
        //todo
        // ...Modifiers,
        ...CommonModifiers(),
    }, { required: true }),
    modificationCategories: new SchemaField(VehicleModCategories()), // is it used?
    modPoints: new NumberField({ required: true, initial: 0 }),
    limits: new SchemaField(VehicleLimits()),
    full_defense_attribute: new StringField({ required: true, initial: "intuition" }),
}


export class Vehicle extends foundry.abstract.TypeDataModel<typeof VehicleData, Actor.Implementation> {
    static override defineSchema() {
        return VehicleData;
    }
}

console.log("VehicleData", VehicleData, new Vehicle());

export type VehicleStatsType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof VehicleStats>>;
