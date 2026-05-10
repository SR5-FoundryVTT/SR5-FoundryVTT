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
const { SchemaField, NumberField, BooleanField, StringField } = foundry.data.fields;

const InitiativeFormula = (defaults: { attributeA: string; attributeB: string; dice: number }) => ({
    attribute_a: new StringField({ required: true, initial: defaults.attributeA, blank: true, choices: SR5.attributes }),
    attribute_b: new StringField({ required: true, initial: defaults.attributeB, blank: true, choices: SR5.attributes }),
    constant: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
    dice: new NumberField({ required: true, nullable: false, integer: true, initial: defaults.dice, min: 0, max: 5, step: 1 }),
});

const SpiritData = () => ({
    // === Core Identity ===
    ...CommonData(),
    spiritType: new StringField({
        required: true,
        initial: 'air',
    }),
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
        ...Attributes(),
        force: new ModifiableField(AttributeField()),
    }),
    force_applies: new SchemaField({
        body: new BooleanField({ initial: true }),
        agility: new BooleanField({ initial: true }),
        reaction: new BooleanField({ initial: true }),
        strength: new BooleanField({ initial: true }),
        willpower: new BooleanField({ initial: true }),
        logic: new BooleanField({ initial: true }),
        intuition: new BooleanField({ initial: true }),
        charisma: new BooleanField({ initial: true }),
        magic: new BooleanField({ initial: true }),
        essence: new BooleanField({ initial: true }),
    }),
    limits: new SchemaField({ ...Limits(), ...AwakendLimits() }),
    values: new SchemaField(PhysicalCombatValues()),

    // === Magic ===
    magic: new SchemaField(MagicData()),

    // === Combat ===
    armor: new ModifiableField(ActorArmorData()),
    initiative: new SchemaField(Initiative('astral', 'meatspace')),
    wounds: new ModifiableField(ModifiableValueSchema()),

    // === Condition & Movement ===
    track: new SchemaField(Tracks('physical', 'stun')),
    movement: new SchemaField(Movement()),

    // === Formulae ===
    initiative_formulae: new SchemaField({
        meatspace: new SchemaField(InitiativeFormula({ attributeA: 'reaction', attributeB: 'intuition', dice: 2 })),
        astral: new SchemaField(InitiativeFormula({ attributeA: 'intuition', attributeB: 'intuition', dice: 3 })),
    }),
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

export class Spirit extends ActorBase<ReturnType<typeof SpiritData>> {
    static override defineSchema() {
        return SpiritData();
    }
    static override LOCALIZATION_PREFIXES = ["SR5.Spirit", "SR5.Actor"];
}

console.log("SpiritData", SpiritData(), new Spirit());

export type InitiativeFormulaType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof InitiativeFormula>>;
