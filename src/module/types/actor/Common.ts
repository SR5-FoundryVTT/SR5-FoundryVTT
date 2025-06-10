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
    language: new SchemaField(KnowledgeSkillList(), { required: true }),
    knowledge: new SchemaField(KnowledgeSkills(), { required: true }),
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
        text: new StringField({ required: true, initial: "" }),
    }, { required: true }),
});

export const Initiative = () => ({
    meatspace: new SchemaField(InitiativeType(), { required: true }),
    astral: new SchemaField(InitiativeType(), { required: true }),
    matrix: new SchemaField(InitiativeType(), { required: true }),
    current: new SchemaField(InitiativeType(), { required: true }),
    edge: new BooleanField({ required: true, initial: false }),
    perception: new StringField({ required: true, initial: "" }),
});

export const MagicData = () => ({
    attribute: new StringField({ required: true, initial: "magic" }),
    projecting: new BooleanField({ required: true, initial: false }),
    initiation: new NumberField({ required: true, nullable: false, initial: 0, }),
});

export const DeviceAttribute = () => ({
    value: new NumberField({ required: true, initial: 0 }),
    att: new StringField({
        required: true,
        blank: true,
        initial: '',
        choices: ['', 'attack', 'sleaze', 'data_processing', 'firewall'],
    }),
    editable: new BooleanField({ required: true, initial: false }),
});

export const MatrixAttributes = () => ({
    att1: new SchemaField(DeviceAttribute(), { required: true }),
    att2: new SchemaField(DeviceAttribute(), { required: true }),
    att3: new SchemaField(DeviceAttribute(), { required: true }),
    att4: new SchemaField(DeviceAttribute(), { required: true }),
});

export const MatrixAttributeField = () => ({
    ...AttributeField(),
    device_att: new StringField({ required: true, initial: "" }),
});

export const MatrixTrackActorData = () => ({
    track: new SchemaField(MatrixTracks(), { required: true }),
});

export const CategoryVisibility = () => ({
    default: new BooleanField({ required: true, initial: true }),
});

export const NPCData = () => ({
    is_grunt: new BooleanField({ required: true, initial: false }),
    professional_rating: new NumberField({ required: true, initial: 0 }),
});

export const MatrixData = () => ({
    dice: new SchemaField(ModifiableValue(), { required: true }),
    base: new SchemaField(ModifiableValue(), { required: true }),

    attack: new SchemaField(MatrixAttributeField(), { required: true }),
    sleaze: new SchemaField(MatrixAttributeField(), { required: true }),
    data_processing: new SchemaField(MatrixAttributeField(), { required: true }),
    firewall: new SchemaField(MatrixAttributeField(), { required: true }),

    condition_monitor: new SchemaField(ConditionData(), { required: true }),
    rating: new NumberField({ required: true, nullable: false, initial: 0 }),
    name: new StringField({ required: true, initial: "" }),
    device: new StringField({ required: true, initial: "" }),
    is_cyberdeck: new BooleanField({ required: true, initial: false }),
    hot_sim: new BooleanField({ required: true, initial: false }),
    running_silent: new BooleanField({ required: true, initial: false }),
    item: new AnyField({ required: false }),
    marks: new TypedObjectField(new NumberField({ required: true, nullable: false, initial: 0 }), { required: true }),
});

export const CommonValues = () => ({
    string: new SchemaField(ModifiableValue(), { required: true }),
});

export const PhysicalCombatValues = () => ({
    recoil: new SchemaField(ModifiableValue(), { required: true }),
    recoil_compensation: new SchemaField(ModifiableValue(), { required: true }),
});

export const MeatSpaceVisibility = () => ({
    hasHeat: new BooleanField({ required: true, initial: false }),
});

export const AstralVisibility = () => ({
    hasAura: new BooleanField({ required: true, initial: false }),
    astralActive: new BooleanField({ required: true, initial: false }),
    affectedBySpell: new BooleanField({ required: true, initial: false }),
});

export const MatrixVisibility =  () => ({
    hasIcon: new BooleanField({ required: true, initial: false }),
    runningSilent: new BooleanField({ required: true, initial: false }),
});

export const VisibilityChecks = () => ({
    astral: new SchemaField(AstralVisibility(), { required: true }),
    meat: new SchemaField(MeatSpaceVisibility(), { required: true }),
    matrix: new SchemaField(MatrixVisibility(), { required: true }),
});

export const ArmorActorData = () => ({
    armor: new SchemaField(ActorArmorData(), { required: true }),
});

export const WoundType = () => ({
    value: new NumberField({ required: true, nullable: false, initial: 0 }),
});

export const WoundsActorData = () => ({
    wounds: new SchemaField(WoundType(), { required: true }),
});

export const PhysicalTrackActorData = () => ({
    track: new SchemaField({ physical: new SchemaField(PhysicalTrack(), { required: true }) }, { required: true }),
});

export const StunTrackActorData = () => ({
    track: new SchemaField({ physical: new SchemaField(StunTrack(), { required: true }) }, { required: true }),
});

export const TwoTrackActorData = () => ({
    track: new SchemaField(Tracks(), { required: true }),
});

export const MagicActorData = () => ({
    magic: new SchemaField(MagicData(), { required: true }),
});

export const MatrixActorData = () => ({
    matrix: new SchemaField(MatrixData(), { required: true }),
});

export const MovementActorData = () => ({
    movement: new SchemaField(Movement(), { required: true }),
});

export const NPCActorData = () => ({
    is_npc: new BooleanField({ required: true, initial: false }),
    npc: new SchemaField(NPCData(), { required: true }),
});

export const CharacterLimits = () => ({
    ...Limits(),
    ...AwakendLimits(),
    ...MatrixLimits(),
});

export const CommonModifiers = () => ({
    defense: new NumberField({ required: true, initial: 0 }),
    defense_dodge: new NumberField({ required: true, initial: 0 }),
    defense_parry: new NumberField({ required: true, initial: 0 }),
    defense_block: new NumberField({ required: true, initial: 0 }),
    defense_melee: new NumberField({ required: true, initial: 0 }),
    defense_ranged: new NumberField({ required: true, initial: 0 }),
    soak: new NumberField({ required: true, initial: 0 }),
    recoil: new NumberField({ required: true, initial: 0 }),
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
    matrix_initiative: new NumberField({ required: true, initial: 0 }),
    matrix_initiative_dice: new NumberField({ required: true, initial: 0 }),
    matrix_track: new NumberField({ required: true, initial: 0 }),
});

const InventoryData = () => ({
    name: new StringField({ required: true, initial: "" }),
    type: new StringField({ required: true, initial: "" }),
    itemIds: new ArrayField(new StringField({ required: true, initial: "" }), { required: true }),
    showAll: new BooleanField({ required: true, initial: false }),
    label: new StringField({ required: true, initial: "" }),
});

const ActiveData = () => ({
    active: new ObjectField({ required: true, initial: {} }),
});

export const CommonData = () => ({
    ...DescriptionPartData(),
    attributes: new SchemaField(Attributes(), { required: true }),
    limits: new SchemaField(Limits(), { required: true }),
    skills: new SchemaField(CharacterSkills(), { required: true }),
    special: new StringField({ required: true, blank: true, choices: ['magic', 'resonance', 'mundane', ''], initial: '' }),
    initiative: new SchemaField(Initiative(), { required: true }),
    // modifiers: new SchemaField(Modifiers, { required: true }),
    //todo fix
    situation_modifiers: new SchemaField({
        environmental: new SchemaField(ActiveData(), { required: true }),
        noise: new SchemaField(ActiveData(), { required: true }),
        background_count: new SchemaField(ActiveData(), { required: true }),
    }, {required: true }),
    values: new SchemaField(CommonValues(), { required: true }),
    inventories: new TypedObjectField(new SchemaField(InventoryData()), { required: true }),
    visibilityChecks: new SchemaField(VisibilityChecks(), { required: true }),
    category_visibility: new SchemaField(CategoryVisibility(), { required: true }),
});

export type MatrixType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof MatrixData>>;
export type InventoryType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof InventoryData>>;
export type InventoriesType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof CommonData>>['inventories'];
