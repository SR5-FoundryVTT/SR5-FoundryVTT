const { SchemaField, NumberField, BooleanField, ObjectField, ArrayField, StringField } = foundry.data.fields;
import { DeviceAttribute } from "../item/DeviceModel";
import { ActorArmor } from "../template/ArmorModel";
import { Attributes, AttributeField } from "../template/AttributesModel";
import { BaseValuePair, ModifiableValue } from "../template/BaseModel";
import { MatrixTracks, PhysicalTrack, StunTrack, Tracks } from "../template/ConditionMonitorsModel";
import { DescriptionPartData } from "../template/DescriptionModel";
import { Limits, AwakendLimits, MatrixLimits } from "../template/LimitsModel";
import { Movement } from "../template/MovementModel";
import { KnowledgeSkillList } from "../template/SkillsModel";

export const CharacterSkills = () => ({
    //todo
    // active: new SchemaField(Skills, { required: true }),
    language: new SchemaField(KnowledgeSkillList(), { required: true }),
    //todo
    // knowledge: new SchemaField(KnowledgeSkills, { required: true }),
});

export const InitiativeType = () => ({
    base: new SchemaField({
        ...BaseValuePair(), ...ModifiableValue()
    }, { required: true }),
    dice: new SchemaField({
        ...BaseValuePair(), ...ModifiableValue(),
        text: new StringField({ required: true, initial: "" }),
    }, { required: true }),
});

export const Initiative = () => ({
    meatspace: new SchemaField(InitiativeType(), { required: true }),
    astral: new SchemaField(InitiativeType(), { required: true }),
    matrix: new SchemaField(InitiativeType(), { required: true }),
    current: new SchemaField(InitiativeType(), { required: true }),
    edge: new BooleanField({ required: false, initial: false }),
    perception: new StringField({ required: true, initial: "" }),
});

export const MagicData = () => ({
    attribute: new StringField({
        required: true,
        initial: "magic",
        choices: ["magic", "resonance"],
    }),
    projecting: new BooleanField({ required: true, initial: false, }),
    initiation: new NumberField({ required: true, initial: 0, }),
});

export const MatrixAttributes = () => ({
    att1: new SchemaField(DeviceAttribute(), { required: true }),
    att2: new SchemaField(DeviceAttribute(), { required: true }),
    att3: new SchemaField(DeviceAttribute(), { required: true }),
    att4: new SchemaField(DeviceAttribute(), { required: true }),
});

export const MatrixAttributeField = () => ({
    ...AttributeField(),
    device_att: new StringField({
        required: true,
        initial: "att1",
        choices: ["att1", "att2", "att3", "att4"],
    }),
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
    dice: new SchemaField({...BaseValuePair(), ...ModifiableValue()}, { required: true }),
    base: new SchemaField({...BaseValuePair(), ...ModifiableValue()}, { required: true }),
    attack: new ObjectField({
        required: true,
        initial: {},
        schema: {
            att1: new StringField({ required: true, initial: "attack" }),
            att2: new StringField({ required: true, initial: "attack" }),
            att3: new StringField({ required: true, initial: "attack" }),
            att4: new StringField({ required: true, initial: "attack" }),
        }
    }),
});

export const InventoryData = () => ({
    name: new StringField({ required: true, initial: "" }),
    type: new StringField({ required: true, initial: "" }),
    items: new ArrayField(new StringField({ required: true, initial: "" }), { required: true }),
    showAll: new BooleanField({ required: false, initial: false }),
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
    armor: new SchemaField(ActorArmor(), { required: true }),
});

export const WoundType = () => ({
    value: new NumberField({ required: true, initial: 0 }),
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
    ...AwakendLimits(),
    ...MatrixLimits(),
});

export const CommonModifiers = () => ({
    defense: new NumberField({ required: false, initial: 0 }),
    defense_dodge: new NumberField({ required: false, initial: 0 }),
    defense_parry: new NumberField({ required: false, initial: 0 }),
    defense_block: new NumberField({ required: false, initial: 0 }),
    defense_melee: new NumberField({ required: false, initial: 0 }),
    defense_ranged: new NumberField({ required: false, initial: 0 }),
    soak: new NumberField({ required: false, initial: 0 }),
    recoil: new NumberField({ required: false, initial: 0 }),
});

export const MatrixModifiers = () => ({
    matrix_initiative: new NumberField({ required: false, initial: 0 }),
    matrix_initiative_dice: new NumberField({ required: false, initial: 0 }),
    matrix_track: new NumberField({ required: false, initial: 0 }),
});

export const CommonData = () => ({
    ...DescriptionPartData(),
    attributes: new SchemaField(Attributes(), { required: true }),
    limits: new SchemaField(Limits(), { required: true }),
    skills: new SchemaField(CharacterSkills(), { required: true }),
    // special: new SchemaField(SpecialTrait, { required: true }),
    initiative: new SchemaField(Initiative(), { required: true }),
    // modifiers: new SchemaField(Modifiers, { required: true }),
    //todo fix
    situation_modifiers: new ObjectField({ required: true, initial: {} }),
    values: new SchemaField(CommonValues(), { required: true }),
    // inventories: new SchemaField(InventoriesData, { required: true }),
    visibilityChecks: new SchemaField(VisibilityChecks(), { required: true }),
    category_visibility: new SchemaField(CategoryVisibility(), { required: true }),
});
