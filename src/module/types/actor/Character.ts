import { CommonData, PhysicalCombatValues, CharacterLimits, CreateModifiers, MagicData, ActorBase } from "./Common";
import { Attributes, AttributeField, MatrixActorAttributes } from '../template/Attributes';
import { ModifiableValue, ValueMaxPair } from "../template/Base";
import { Tracks } from "../template/ConditionMonitors";
import { ActorArmorData } from "../template/Armor";
import { Movement } from "../template/Movement";
import { Initiative } from "../template/Initiative";
import { MatrixData } from '../template/Matrix';
import { VisibilityChecks } from "../template/Visibility";
import { ModifiableField } from "../fields/ModifiableField";
const { SchemaField, NumberField, BooleanField, StringField } = foundry.data.fields;

const CharacterAttributes = () => ({
    ...Attributes(),
    ...MatrixActorAttributes(),
    initiation: new ModifiableField(AttributeField()),
    submersion: new ModifiableField(AttributeField()),
});

const CharacterData = () => ({
    ...CommonData(),

    // === Core Identity ===
    metatype: new StringField({ required: true }),
    is_critter: new BooleanField(),
    is_npc: new BooleanField(),
    npc: new SchemaField({ is_grunt: new BooleanField() }),
    full_defense_attribute: new StringField({ required: true, initial: "willpower" }),
    matrix_full_defense_attribute: new StringField({ required: true, initial: "willpower" }),
    special: new StringField({ required: true, choices: ['magic', 'resonance', 'mundane'], initial: 'mundane' }),

    // === Attributes & Limits ===
    attributes: new SchemaField(CharacterAttributes()),
    limits: new SchemaField(CharacterLimits()),

    // === Combat ===
    armor: new ModifiableField(ActorArmorData()),
    initiative: new SchemaField(Initiative('meatspace', 'astral', 'matrix')),
    values: new SchemaField(PhysicalCombatValues()),
    wounds: new ModifiableField(ModifiableValue()),

    visibilityChecks: new SchemaField(VisibilityChecks('astral', 'matrix', 'meatspace')),

    // === Condition & Movement ===
    track: new SchemaField(Tracks('physical', 'stun')),
    movement: new SchemaField(Movement()),

    // === Magic & Matrix ===
    magic: new SchemaField(MagicData()),
    matrix: new SchemaField(MatrixData()),
    technomancer: new SchemaField({
        attribute: new StringField({ required: true, initial: "willpower" }), // fade attribute
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
        "drain", "fade", "essence", "public_grid", 'mark_damage', "two_marks", "three_marks",
        "control_rig_rating",
        // Miscellaneous
        "composure", "lift_carry", "judge_intentions", "memory", "global"
    )),
});

export class Character extends ActorBase<ReturnType<typeof CharacterData>> {
    static override defineSchema() {
        return CharacterData();
    }
}

console.log("CharacterData:", CharacterData(), new Character());
