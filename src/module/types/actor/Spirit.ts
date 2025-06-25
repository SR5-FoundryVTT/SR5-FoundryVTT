import { ActorArmorData } from "../template/Armor";
import { AttributeField, Attributes } from "../template/Attributes";
import { ModifiableValue } from "../template/Base";
import { Tracks } from "../template/ConditionMonitors";
import { Initiative } from "../template/Initiative";
import { AwakendLimits, Limits } from "../template/Limits";
import { Movement } from "../template/Movement";
import { VisibilityChecks } from "../template/Visibility";
import { CommonData, PhysicalCombatValues, CreateModifiers, MagicData } from "./Common";
const { SchemaField, NumberField, BooleanField, StringField } = foundry.data.fields;

const SpiritData = {
    // === Core Identity ===
    ...CommonData(),
    spiritType: new StringField({ required: true }),
    full_defense_attribute: new StringField({ required: true, initial: "willpower" }),
    special: new StringField({ required: true, initial: "magic", readonly: true }),

    // === Attributes & Limits ===
    attributes: new SchemaField({
        ...Attributes(),
        force: new SchemaField(AttributeField())
    }),
    limits: new SchemaField({ ...Limits(), ...AwakendLimits() }),
    values: new SchemaField(PhysicalCombatValues()),
    force: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),

    // === Magic ===
    magic: new SchemaField(MagicData()),

    // === Combat ===
    armor: new SchemaField(ActorArmorData()),
    initiative: new SchemaField(Initiative('astral', 'meatspace')),
    wounds: new SchemaField(ModifiableValue()),

    // === Condition & Movement ===
    track: new SchemaField(Tracks('physical', 'stun')),
    movement: new SchemaField(Movement()),

    // === Summoning ===
    summonerUuid: new StringField({ required: true }),
    services: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
    bound: new BooleanField(),

    // === Visibility ===
    visibilityChecks: new SchemaField(VisibilityChecks("matrix", "meatspace")),

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


export class Spirit extends foundry.abstract.TypeDataModel<typeof SpiritData, Actor.Implementation> {
    static override defineSchema() {
        return SpiritData;
    }
}

console.log("SpiritData", SpiritData, new Spirit());
