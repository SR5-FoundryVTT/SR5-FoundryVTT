const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;
import { ShadowrunModel as SM } from "../ShadowrunModel";

const VehicleStat = {
    ...SM.ModifiableValue,
    label: new StringField({ required: true, initial: "" }),
    temp: new NumberField({ required: true, initial: 0 }),
    hidden: new BooleanField({ required: true, initial: false }),
}

const VehicleAttributes = {
    ...SM.Attributes,
    pilot: new SchemaField(SM.AttributeField, { required: true }),
}

const VehicleStats = {
    pilot: new SchemaField(VehicleStat, { required: true }),
    handling: new SchemaField(VehicleStat, { required: true }),
    off_road_handling: new SchemaField(VehicleStat, { required: true }),
    speed: new SchemaField(VehicleStat, { required: true }),
    off_road_speed: new SchemaField(VehicleStat, { required: true }),
    acceleration: new SchemaField(VehicleStat, { required: true }),
    sensor: new SchemaField(VehicleStat, { required: true }),
    seats: new SchemaField(VehicleStat, { required: true }),
}

const VehicleModCategories = {
    body: new NumberField({ required: true, initial: 0 }),
    power_train: new NumberField({ required: true, initial: 0 }),
    protection: new NumberField({ required: true, initial: 0 }),
    electromagnetic: new NumberField({ required: true, initial: 0 }),
    cosmetic: new NumberField({ required: true, initial: 0 }),
    weapons: new NumberField({ required: true, initial: 0 }),
}

const VehicleData = {
    ...SM.CommonData,
    ...SM.ArmorActorData,
    ...SM.MatrixActorData,
    ...SM.MovementActorData,
    ...SM.ImportFlags,
    ...SM.PhysicalTrackActorData,
    value: new SchemaField(SM.PhysicalCombatValues, { required: true }),
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
    vehicle_stats: new SchemaField(VehicleStats, { required: true }),
    attributes: new SchemaField(VehicleAttributes, { required: true }),
    networkController: new StringField({ required: true, initial: "" }),
    modifiers: new SchemaField({
        //todo
        // ...SM.Modifiers,
        ...SM.CommonModifiers,
    }, { required: true }),
    modificationCategories: new SchemaField(VehicleModCategories, { required: true }),
    modPoints: new NumberField({ required: true, initial: 0 }),
}

export class Vehicle extends foundry.abstract.TypeDataModel<typeof VehicleData, Actor.Implementation> {
    static override defineSchema() {
        return VehicleData;
    }
}
