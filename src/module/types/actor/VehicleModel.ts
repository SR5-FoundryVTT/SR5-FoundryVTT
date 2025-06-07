const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;
import { CommonData, ArmorActorData, MatrixActorData, MovementActorData, PhysicalTrackActorData, PhysicalCombatValues, CommonModifiers } from "./CommonModel";
import { Attributes, AttributeField } from "../template/AttributesModel";
import { ModifiableValue } from "../template/BaseModel";
import { ImportFlags } from "../template/ImportFlagsModel";
import { VehicleLimits } from "../template/LimitsModel";

const VehicleAttributes = () => ({
    ...Attributes(),
    pilot: new SchemaField(AttributeField(), { required: true }),
});

const VehicleStats = () => ({
    pilot: new SchemaField(AttributeField(), { required: true }),
    handling: new SchemaField(AttributeField(), { required: true }),
    off_road_handling: new SchemaField(AttributeField(), { required: true }),
    speed: new SchemaField(AttributeField(), { required: true }),
    off_road_speed: new SchemaField(AttributeField(), { required: true }),
    acceleration: new SchemaField(AttributeField(), { required: true }),
    sensor: new SchemaField(AttributeField(), { required: true }),
    seats: new SchemaField(AttributeField(), { required: true }),
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
    values: new SchemaField(PhysicalCombatValues(), { required: true }),
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
    isDrone: new BooleanField({ required: true, initial: false }),
    isOffRoad: new BooleanField({ required: true, initial: false }),
    driver: new StringField({ required: true, initial: "" }),
    environment: new StringField({
        required: true,
        initial: "speed",
        choices: ["speed", "handling"],
    }),
    vehicle_stats: new SchemaField(VehicleStats(), { required: true }),
    attributes: new SchemaField(VehicleAttributes(), { required: true }),
    networkController: new StringField({ required: true, initial: "" }),
    modifiers: new SchemaField({
        //todo
        // ...Modifiers,
        ...CommonModifiers(),
    }, { required: true }),
    modificationCategories: new SchemaField(VehicleModCategories(), { required: true }),
    modPoints: new NumberField({ required: true, initial: 0 }),
    limits: new SchemaField(VehicleLimits(), { required: true }),
}


export class Vehicle extends foundry.abstract.TypeDataModel<typeof VehicleData, Actor.Implementation> {
    static override defineSchema() {
        return VehicleData;
    }
}

console.log("VehicleData", VehicleData, new Vehicle());

export type VehicleStatsType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof VehicleStats>>;
