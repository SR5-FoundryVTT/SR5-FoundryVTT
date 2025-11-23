import { SR5 } from "@/module/config";
import { Movement } from "../template/Movement";
import { MatrixData } from "../template/Matrix";
import { ActorArmorData } from "../template/Armor";
import { Initiative } from "../template/Initiative";
import { Tracks } from "../template/ConditionMonitors";
import { VisibilityChecks } from "../template/Visibility";
import { ModifiableField } from "../fields/ModifiableField";
import { ModifiableValue, ValueMaxPair } from "../template/Base";
import { Attributes, MatrixActorAttributes } from '../template/Attributes';
import { CommonData, PhysicalCombatValues, CharacterLimits, CreateModifiers, MagicData, ActorBase } from "./Common";
const { SchemaField, NumberField, BooleanField, StringField } = foundry.data.fields;

export const CritterData = () => ({
    ...CommonData(),
    
    // === Core Identity ===
    metatype: new StringField({ required: true }),
    is_critter: new BooleanField(),
    is_npc: new BooleanField(),
    npc: new SchemaField({ is_grunt: new BooleanField() }),
    full_defense_attribute: new StringField({
        required: true,
        initial: "willpower",
        choices: SR5.attributes,
    }),
    special: new StringField({
        required: true,
        initial: 'mundane',
        choices: SR5.specialTypes,
    }),

    // === Attributes & Limits ===
    attributes: new SchemaField({
        ...Attributes(),
        ...MatrixActorAttributes(),
    }),
    limits: new SchemaField(CharacterLimits()),

    // === Combat ===
    armor: new ModifiableField(ActorArmorData()),
    initiative: new SchemaField(Initiative('meatspace', 'astral', 'matrix')),
    values: new SchemaField(PhysicalCombatValues()),
    wounds: new ModifiableField(ModifiableValue()),

    visibilityChecks: new SchemaField(VisibilityChecks('astral', 'meatspace')),

    // === Condition & Movement ===
    track: new SchemaField(Tracks('matrix', 'physical', 'stun')),
    movement: new SchemaField(Movement()),

    // === Magic & Matrix ===
    magic: new SchemaField(MagicData()),
    matrix: new SchemaField(MatrixData()),
    technomancer: new SchemaField({
        attribute: new StringField({
            required: true,
            initial: "willpower",
            choices: SR5.attributes
        }), // fade attribute
        submersion: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
    }),

    // === Economy & Reputation ===
    karma: new SchemaField(ValueMaxPair()),
    nuyen: new NumberField({ required: true, nullable: false, initial: 0 }),
    notoriety: new NumberField({ required: true, nullable: false, initial: 0 }),
    public_awareness: new NumberField({ required: true, nullable: false, initial: 0 }),
    street_cred: new NumberField({ required: true, nullable: false, initial: 0 }),

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
});

export class Critter extends ActorBase<ReturnType<typeof CritterData>> {
    static override defineSchema() {
        return CritterData();
    }
    static override LOCALIZATION_PREFIXES = ["SR5.Character", "SR5.Actor"];
}

console.log("CritterData", CritterData(), new Critter());
