import { MatrixData } from "../template/Matrix";
import { Attributes } from "../template/Attributes";
import { Initiative } from "../template/Initiative";
import { VisibilityChecks } from "../template/Visibility";
import { Limits, MatrixLimits } from "../template/Limits";
import { ActorBase, CommonData, CreateModifiers } from "./Common";
const { SchemaField, NumberField, BooleanField, StringField } = foundry.data.fields;

const SpriteData = () => ({
    // === Core Identity ===
    ...CommonData(),
    attributes: new SchemaField(Attributes()),
    spriteType: new StringField({ required: true }),
    special: new StringField({ required: true, initial: "resonance", readonly: true }),
    full_defense_attribute: new StringField({ required: true, initial: "willpower" }),

    // === Matrix & Host ===
    matrix: new SchemaField(MatrixData()),

    // === Summoning & Binding ===
    level: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
    services: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
    registered: new BooleanField(),
    technomancerUuid: new StringField({ required: true }),

    // === Condition & Monitoring ===
    // track: new SchemaField(Tracks('matrix')),
    initiative: new SchemaField(Initiative('matrix')),
    limits: new SchemaField({ ...Limits(), ...MatrixLimits() }),

    // === Visibility ===
    visibilityChecks: new SchemaField(VisibilityChecks("matrix")),

    // === Modifiers ===
    modifiers: new SchemaField(CreateModifiers(
        // Limits
        "physical_limit", "social_limit", "mental_limit",
        // Initiative
        "matrix_initiative", "matrix_initiative_dice",
        "meat_initiative", "meat_initiative_dice",
        // Tracks
        "stun_track", "matrix_track", "physical_track", "physical_overflow_track",
        // Tolerance
        "wound_tolerance", "pain_tolerance_stun", "pain_tolerance_physical",
        // Combat/Defense
        "armor", "multi_defense", "reach", "defense", "defense_dodge", "defense_parry",
        "defense_block", "defense_melee", "defense_ranged", "soak", "recoil",
        // Magic/Matrix
        "drain", "fade", "essence", 'public_grid',
        // Miscellaneous
        "composure", "lift_carry", "judge_intentions", "memory", "global"
    )),
});

export class Sprite extends ActorBase<ReturnType<typeof SpriteData>> {
    static override defineSchema() {
        return SpriteData();
    }
}

console.log("SpriteData", SpriteData(), new Sprite());
