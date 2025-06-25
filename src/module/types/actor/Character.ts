import { CommonData, PhysicalCombatValues, CharacterLimits, CreateModifiers, MagicData } from "./Common";
import { Attributes, AttributeField } from "../template/Attributes";
import { ModifiableValue, ValueMaxPair } from "../template/Base";
import { Tracks } from "../template/ConditionMonitors";
import { ActorArmorData } from "../template/Armor";
import { Movement } from "../template/Movement";
import { Initiative } from "../template/Initiative";
import { MatrixData } from "../template/Matrix";
import { VisibilityChecks } from "../template/Visibility";
const { SchemaField, NumberField, BooleanField, StringField } = foundry.data.fields;

const CharacterAttributes = () => ({
    ...Attributes(),
    initiation: new SchemaField(AttributeField()),
    submersion: new SchemaField(AttributeField()),
});

const CharacterData = {
    ...CommonData(),

    // === Core Identity ===
    metatype: new StringField({ required: true }),
    is_critter: new BooleanField(),
    is_npc: new BooleanField(),
    npc: new SchemaField({ is_grunt: new BooleanField() }),
    full_defense_attribute: new StringField({ required: true, initial: "willpower" }),
    special: new StringField({ required: true, choices: ['magic', 'resonance', 'mundane'], initial: 'mundane' }),

    // === Attributes & Limits ===
    attributes: new SchemaField(CharacterAttributes()),
    limits: new SchemaField(CharacterLimits()),

    // === Combat ===
    armor: new SchemaField(ActorArmorData()),
    initiative: new SchemaField(Initiative('meatspace', 'astral', 'matrix')),
    values: new SchemaField(PhysicalCombatValues()),
    wounds: new SchemaField(ModifiableValue()),

    visibilityChecks: new SchemaField(VisibilityChecks('astral', 'matrix', 'meatspace')),

    // === Condition & Movement ===
    track: new SchemaField(Tracks('matrix', 'physical', 'stun')),
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
        "drain", "fade", "essence",
        // Miscellaneous
        "composure", "lift_carry", "judge_intentions", "memory", "global"
    )),
};

export class Character extends foundry.abstract.TypeDataModel<typeof CharacterData, Actor.Implementation> {
    static override defineSchema() {
        return CharacterData;
    }

    static override migrateData(source) {
        if (!source || typeof source !== "object" || Object.keys(source).length === 0)
            return super.migrateData(source);

        const result = source as Character['_source'];

        // Reset broken legacy data.
        if (isNaN(source.attributes.essence.value)) {
            result.attributes.essence.value = 6; // Default essence value if not set, but is reculated during datePrep anyway
        }

        return super.migrateData(source);
    }
}

console.log("CharacterData:", CharacterData, new Character());
