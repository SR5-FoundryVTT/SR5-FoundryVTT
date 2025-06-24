import { ActorArmorData } from "../template/Armor";
import { Attributes, AttributeField } from "../template/Attributes";
import { ModifiableValue } from "../template/Base";
import { ConditionData } from "../template/Condition";
import { MatrixTracks, PhysicalTrack, StunTrack, Tracks } from "../template/ConditionMonitors";
import { DescriptionPartData } from "../template/Description";
import { Limits, AwakendLimits, MatrixLimits } from "../template/Limits";
import { Movement } from "../template/Movement";
import { KnowledgeSkillList, KnowledgeSkills, Skills } from "../template/Skills";
const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField, TypedObjectField } = foundry.data.fields;

export const CharacterSkills = () => ({
    active: Skills(),
    language: new SchemaField(KnowledgeSkillList('intuition')),
    knowledge: new SchemaField(KnowledgeSkills()),
});

export const InitiativeType = () => ({
    base: new SchemaField({
        ...ModifiableValue(),
        value: new NumberField({required: true, nullable: false, initial: 0}),
        base: new NumberField({required: true, nullable: false, initial: 0}),
    }, { required: true }),
    dice: new SchemaField({
        ...ModifiableValue(),
        value: new NumberField({required: true, nullable: false, initial: 0}),
        base: new NumberField({required: true, nullable: false, initial: 0}),
        text: new StringField({ required: true }),
    }, { required: true }),
});

export const Initiative = () => ({
    meatspace: new SchemaField(InitiativeType()),
    astral: new SchemaField(InitiativeType()),
    matrix: new SchemaField(InitiativeType()),
    current: new SchemaField(InitiativeType()),
    edge: new BooleanField(),
    perception: new StringField({ required: true, initial: "meatspace" }),
});

export const MagicData = () => ({
    // Drain attribute
    attribute: new StringField({ required: true, initial: "logic" }),
    projecting: new BooleanField(),
    initiation: new NumberField({ required: true, nullable: false, initial: 0 }),
});

export const DeviceAttribute = (initialAtt: '' | 'attack' | 'sleaze' | 'data_processing' | 'firewall') => ({
    value: new NumberField({ required: true, initial: 0 }),
    att: new StringField({
        required: true,
        blank: true,
        initial: initialAtt,
        choices: ['', 'attack', 'sleaze', 'data_processing', 'firewall'],
    }),
    editable: new BooleanField(),
});

export const MatrixAttributes = () => ({
    att1: new SchemaField(DeviceAttribute('attack')),
    att2: new SchemaField(DeviceAttribute('sleaze')),
    att3: new SchemaField(DeviceAttribute('data_processing')),
    att4: new SchemaField(DeviceAttribute('firewall')),
});

export const MatrixAttributeField = () => ({
    ...AttributeField(),
    device_att: new StringField({ required: true }),
});

export const MatrixTrackActorData = () => ({
    track: new SchemaField(MatrixTracks()),
});

export const CategoryVisibility = () => ({
    default: new BooleanField({ required: true, initial: true }),
});

export const NPCData = () => ({
    is_grunt: new BooleanField(),
    professional_rating: new NumberField({ required: true, nullable: false, initial: 0 }),
});

export const MatrixData = () => ({
    dice: new SchemaField(ModifiableValue()),
    // TODO: taMiF check if it's used
    base: new SchemaField(ModifiableValue()),

    attack: new SchemaField(MatrixAttributeField()),
    sleaze: new SchemaField(MatrixAttributeField()),
    data_processing: new SchemaField(MatrixAttributeField()),
    firewall: new SchemaField(MatrixAttributeField()),

    condition_monitor: new SchemaField(ConditionData()),
    rating: new NumberField({ required: true, nullable: false, initial: 0 }),
    name: new StringField({ required: true }),
    // TODO: tamIf check if it's used
    device: new StringField({ required: true }),
    is_cyberdeck: new BooleanField(),
    hot_sim: new BooleanField(),
    running_silent: new BooleanField(),
    item: new AnyField({ required: false }),
    marks: new TypedObjectField(new NumberField({ required: true, nullable: false, initial: 0 })),
});

export const CommonValues = () => ({
    string: new SchemaField(ModifiableValue()),
});

export const PhysicalCombatValues = () => ({
    recoil: new SchemaField(ModifiableValue()),
    recoil_compensation: new SchemaField(ModifiableValue()),
});

export const MeatSpaceVisibility = () => ({
    hasHeat: new BooleanField({ initial: true }),
});

export const AstralVisibility = () => ({
    hasAura: new BooleanField({ initial: true }),
    astralActive: new BooleanField(),
    affectedBySpell: new BooleanField(),
});

export const MatrixVisibility =  () => ({
    hasIcon: new BooleanField({ initial: true }),
    runningSilent: new BooleanField(),
});

export const VisibilityChecks = () => ({
    astral: new SchemaField(AstralVisibility()),
    meat: new SchemaField(MeatSpaceVisibility()),
    matrix: new SchemaField(MatrixVisibility()),
});

export const ArmorActorData = () => ({
    armor: new SchemaField(ActorArmorData()),
});

export const WoundsActorData = () => ({
    wounds: new SchemaField(ModifiableValue()),
});

export const PhysicalTrackActorData = () => ({
    track: new SchemaField({ physical: new SchemaField(PhysicalTrack()) }),
});

export const StunTrackActorData = () => ({
    track: new SchemaField({ physical: new SchemaField(StunTrack()) }),
});

export const TwoTrackActorData = () => ({
    track: new SchemaField(Tracks()),
});

export const MagicActorData = () => ({
    magic: new SchemaField(MagicData()),
});

export const MatrixActorData = () => ({
    matrix: new SchemaField(MatrixData()),
});

export const MovementActorData = () => ({
    movement: new SchemaField(Movement()),
});

export const NPCActorData = () => ({
    is_npc: new BooleanField(),
    npc: new SchemaField(NPCData()),
});

export const CharacterLimits = () => ({
    ...Limits(),
    ...AwakendLimits(),
    ...MatrixLimits(),
});

export const CommonModifiers = () => ({
    defense: new NumberField({ required: true, nullable: false, initial: 0 }),
    defense_dodge: new NumberField({ required: true, nullable: false, initial: 0 }),
    defense_parry: new NumberField({ required: true, nullable: false, initial: 0 }),
    defense_block: new NumberField({ required: true, nullable: false, initial: 0 }),
    defense_melee: new NumberField({ required: true, nullable: false, initial: 0 }),
    defense_ranged: new NumberField({ required: true, nullable: false, initial: 0 }),
    soak: new NumberField({ required: true, nullable: false, initial: 0 }),
    recoil: new NumberField({ required: true, nullable: false, initial: 0 }),
    matrix_track: new NumberField({ required: true, nullable: false, initial: 0 }),
    reach: new NumberField({ required: true, nullable: false, initial: 0 }),
    stun_track: new NumberField({ required: true, nullable: false, initial: 0 }),
    physical_track: new NumberField({ required: true, nullable: false, initial: 0 }),
    physical_overflow_track: new NumberField({ required: true, nullable: false, initial: 0 }),
    multi_defense: new NumberField({ required: true, nullable: false, initial: 0 }),
    global: new NumberField({ required: true, nullable: false, initial: 0 }),
    wound_tolerance: new NumberField({ required: true, nullable: false, initial: 0 }),
});

export const MatrixModifiers = () => ({
    matrix_initiative: new NumberField({ required: true, nullable: false, initial: 0 }),
    matrix_initiative_dice: new NumberField({ required: true, nullable: false, initial: 0 }),
    matrix_track: new NumberField({ required: true, nullable: false, initial: 0 }),
});

const InventoryData = () => ({
    name: new StringField({ required: true }),
    type: new StringField({ required: true }),
    itemIds: new ArrayField(new StringField({ required: true })),
    showAll: new BooleanField(),
    label: new StringField({ required: true }),
});

const ActiveData = () => ({
    active: new ObjectField({ required: true, initial: {} }),
});

export const CommonData = () => ({
    ...DescriptionPartData(),
    attributes: new SchemaField(Attributes()),
    limits: new SchemaField(Limits()),
    skills: new SchemaField(CharacterSkills()),
    special: new StringField({ required: true, choices: ['magic', 'resonance', 'mundane'], initial: 'mundane' }),
    initiative: new SchemaField(Initiative()),
    situation_modifiers: new SchemaField({
        environmental: new SchemaField(ActiveData()),
        noise: new SchemaField(ActiveData()),
        background_count: new SchemaField(ActiveData()),
    }),
    values: new TypedObjectField(new SchemaField(ModifiableValue())),
    inventories: new TypedObjectField(
        new SchemaField(InventoryData()),
        { initial: { "All": { name: "All", type: "all", itemIds: [], showAll: true, label: "SR5.Labels.Inventory.All" } } }
    ),
    visibilityChecks: new SchemaField(VisibilityChecks()),
    category_visibility: new SchemaField(CategoryVisibility()),
});

export type MatrixType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof MatrixData>>;
export type InventoryType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof InventoryData>>;
export type InventoriesType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof CommonData>>['inventories'];

