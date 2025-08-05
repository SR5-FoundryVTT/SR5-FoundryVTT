import { CommonData, PhysicalCombatValues, CreateModifiers, ActorBase } from "./Common";
import { Attributes, AttributeField } from "../template/Attributes";
import { VehicleLimits } from "../template/Limits";
import { Movement } from "../template/Movement";
import { Tracks } from "../template/ConditionMonitors";
import { ActorArmorData } from "../template/Armor";
import { Initiative } from "../template/Initiative";
import { MatrixData } from "../template/Matrix";
import { VisibilityChecks } from "../template/Visibility";
import { ModifiableField } from "../fields/ModifiableField";
const { SchemaField, NumberField, BooleanField, StringField } = foundry.data.fields;

const VehicleStats = () => ({
    pilot: new ModifiableField(AttributeField()),
    handling: new ModifiableField(AttributeField()),
    off_road_handling: new ModifiableField(AttributeField()),
    speed: new ModifiableField(AttributeField()),
    off_road_speed: new ModifiableField(AttributeField()),
    acceleration: new ModifiableField(AttributeField()),
    sensor: new ModifiableField(AttributeField()),
    seats: new ModifiableField(AttributeField()),
});

const VehicleData = {
    // === Common Base ===
    ...CommonData(),

    // === Identity & Classification ===
    special: new StringField({ required: true, initial: "mundane", readonly: true }),
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
    environment: new StringField({
        required: true,
        initial: "speed",
        choices: ["speed", "handling"],
    }),
    isDrone: new BooleanField(),
    isOffRoad: new BooleanField(),

    // === Core Stats & Attributes ===
    attributes: new SchemaField(Attributes()),
    values: new SchemaField(PhysicalCombatValues()),
    limits: new SchemaField(VehicleLimits()),
    vehicle_stats: new SchemaField(VehicleStats()),
    modPoints: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
    modificationCategories: new SchemaField({
        body: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
        power_train: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
        protection: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
        electromagnetic: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
        cosmetic: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
        weapons: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
    }),

    // === Matrix & Initiative ===
    matrix: new SchemaField(MatrixData()),
    initiative: new SchemaField(Initiative('meatspace', 'matrix')),
    full_defense_attribute: new StringField({ required: true, initial: "intuition" }),
    visibilityChecks: new SchemaField(VisibilityChecks("matrix", "meatspace")),

    // === Driver & Networking ===
    driver: new StringField({ required: true }),
    master: new StringField({ required: true }),

    // === Condition & Movement ===
    track: new SchemaField(Tracks('physical', 'matrix')),
    movement: new SchemaField(Movement()),

    // === Protection ===
    armor: new ModifiableField(ActorArmorData()),

    // === Modifiers ===
    modifiers: new SchemaField(CreateModifiers(
        // Limits
        "physical_limit", "astral_limit", "social_limit", "mental_limit",
        // Initiative
        "astral_initiative", "astral_initiative_dice",
        "matrix_initiative", "matrix_initiative_dice",
        "meat_initiative", "meat_initiative_dice",
        // Tracks
        "stun_track", "matrix_track", "physical_track", "physical_overflow_track",
        // Movement
        "walk", "run",
        // Tolerance
        "wound_tolerance", "pain_tolerance_stun", "pain_tolerance_physical",
        // Combat/Defense
        "armor", "multi_defense", "reach", "defense", "defense_dodge", "defense_parry",
        "defense_block", "defense_melee", "defense_ranged", "soak", "recoil",
        // Magic/Matrix
        "drain", "fade", "essence",
        // Miscellaneous
        "composure", "lift_carry", "judge_intentions", "memory", "global"
    )),
};

export class Vehicle extends ActorBase<typeof VehicleData> {
    static override defineSchema() {
        return VehicleData;
    }
}

console.log("VehicleData", VehicleData, new Vehicle());

export type VehicleStatsType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof VehicleStats>>;
