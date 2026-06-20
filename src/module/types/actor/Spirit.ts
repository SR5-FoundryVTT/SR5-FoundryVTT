import { SR5 } from "@/module/config";
import { Movement } from "../template/Movement";
import { ActorArmorData } from "../template/Armor";
import { ModifiableValueSchema } from "../template/Base";
import { Initiative } from "../template/Initiative";
import { Tracks } from "../template/ConditionMonitors";
import { VisibilityChecks } from "../template/Visibility";
import { AwakendLimits, Limits } from "../template/Limits";
import { ModifiableField } from "../fields/ModifiableField";
import { AttributeField, Attributes } from '../template/Attributes';
import { CommonData, PhysicalCombatValues, CreateModifiers, MagicData, ActorBase } from "./Common";
import { TagifySelectField } from '../fields/TagifySelectField';
const { SchemaField, NumberField, BooleanField, StringField } = foundry.data.fields;

const SpiritData = () => ({
    // === Core Identity ===
    ...CommonData(),
    spiritType: new TagifySelectField(),
    full_defense_attribute: new StringField({
        required: true,
        initial: "willpower",
        choices: SR5.attributes,
    }),
    special: new StringField({ required: true, initial: "magic", choices: ["magic"], readonly: true }),
    is_npc: new BooleanField({ initial: true }),
    npc: new SchemaField({ is_grunt: new BooleanField() }),

    // === Attributes & Limits ===
    attributes: new SchemaField({
        ...Attributes({ isSpirit: true }),
        force: new ModifiableField(AttributeField()),
    }),
    limits: new SchemaField({ ...Limits(), ...AwakendLimits() }),
    values: new SchemaField(PhysicalCombatValues()),

    // === Magic ===
    magic: new SchemaField(MagicData()),

    // === Combat ===
    armor: new SchemaField(ActorArmorData()),
    wounds: new ModifiableField(ModifiableValueSchema()),
    initiative: new SchemaField(Initiative({
        astral: { attributeA: 'force', attributeB: 'force', constant: 0, dice: 3 },
        meatspace: { attributeA: 'reaction', attributeB: 'intuition', constant: 0, dice: 2 },
    })),

    // === Condition & Movement ===
    track: new SchemaField(Tracks('physical', 'stun')),
    movement: new SchemaField(Movement()),

    half_value_skill: new BooleanField({ initial: false }),

    // === Summoning ===
    summonerUuid: new StringField({ required: true }),
    services: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0, step: 1 }),
    bound: new BooleanField(),

    // === Visibility ===
    visibilityChecks: new SchemaField(VisibilityChecks("astral", "astralActive")),

    // === Modifiers ===
    modifiers: new SchemaField(CreateModifiers(
        // Limits
        "physical_limit", "astral_limit", "social_limit", "mental_limit",
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

export class Spirit extends ActorBase<ReturnType<typeof SpiritData>> {
    static override defineSchema() {
        return SpiritData();
    }
    static override LOCALIZATION_PREFIXES = ["SR5.Spirit", "SR5.Actor"];
}

console.log("SpiritData", SpiritData(), new Spirit());
