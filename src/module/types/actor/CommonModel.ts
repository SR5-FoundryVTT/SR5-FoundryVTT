const { SchemaField, NumberField, BooleanField, ObjectField, ArrayField, StringField } = foundry.data.fields;
import { ShadowrunModel as SM } from "../ShadowrunModel";

export const CommonData = {
    ...SM.DescriptionPartData,
    attributes: new SchemaField(SM.Attributes, { required: true }),
    limits: new SchemaField(SM.Limits, { required: true }),
    skills: new SchemaField(SM.CharacterSkills, { required: true }),
    // special: new SchemaField(SM.SpecialTrait, { required: true }),
    initiative: new SchemaField(SM.Initiative, { required: true }),
    // modifiers: new SchemaField(SM.Modifiers, { required: true }),
    //todo fix
    situation_modifiers: new ObjectField({ required: true, initial: {} }),
    values: new SchemaField(SM.CommonValues, { required: true }),
    // inventories: new SchemaField(SM.InventoriesData, { required: true }),
    visibilityChecks: new SchemaField(SM.VisibilityChecks, { required: true }),
    category_visibility: new SchemaField(SM.CategoryVisibility, { required: true }),
}

export const CharacterSkills = {
    //todo
    // active: new SchemaField(SM.Skills, { required: true }),
    language: new SchemaField(SM.KnowledgeSkillList, { required: true }),
    //todo
    // knowledge: new SchemaField(SM.KnowledgeSkills, { required: true }),
}

export const InitiativeType = {
    base: new SchemaField({
        ...SM.BaseValuePair, ...SM.ModifiableValue
    }, { required: true }),
    dice: new SchemaField({
        ...SM.BaseValuePair, ...SM.ModifiableValue,
        text: new StringField({ required: true, initial: "" }),
    }, { required: true }),
}

export const Initiative = {
    perception: new StringField({ required: true, initial: "" }),
    meatspace: new SchemaField(InitiativeType, { required: true }),
    astral: new SchemaField(InitiativeType, { required: true }),
    matrix: new SchemaField(InitiativeType, { required: true }),
    current: new SchemaField(InitiativeType, { required: true }),
    edge: new BooleanField({ required: false, initial: false }),
}

export const MagicData = {
    attribute: new StringField({
        required: true,
        initial: "magic",
        choices: ["magic", "resonance"],
    }),
    projecting: new BooleanField({ required: true, initial: false, }),
    initiation: new NumberField({ required: true, initial: 0, }),
}

export const MatrixAttributes = {
    att1: new SchemaField(SM.DeviceAttribute, { required: true }),
    att2: new SchemaField(SM.DeviceAttribute, { required: true }),
    att3: new SchemaField(SM.DeviceAttribute, { required: true }),
    att4: new SchemaField(SM.DeviceAttribute, { required: true }),
}

export const MatrixAttributeField = {
    ...SM.AttributeField,
    device_att: new StringField({
        required: true,
        initial: "att1",
        choices: ["att1", "att2", "att3", "att4"],
    }),
}

export const MatrixTrackActorData = {
    track: new SchemaField(SM.MatrixTracks, { required: true }),
}

export const CategoryVisibility = {
    default: new BooleanField({ required: true, initial: true }),
}

export const NPCData = {
    is_grunt: new BooleanField({ required: true, initial: false }),
    professional_rating: new NumberField({ required: true, initial: 0 }),
}

export const MatrixData = {
    dice: new SchemaField({...SM.BaseValuePair, ...SM.ModifiableValue}, { required: true }),
    base: new SchemaField({...SM.BaseValuePair, ...SM.ModifiableValue}, { required: true }),
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
}

export const InventoryData = {
    name: new StringField({ required: true, initial: "" }),
    type: new StringField({ required: true, initial: "" }),
    items: new ArrayField(new StringField({ required: true, initial: "" }), { required: true }),
    showAll: new BooleanField({ required: false, initial: false }),
}

export const CommonValues = {
    string: new SchemaField(SM.ModifiableValue, { required: true }),
}

export const PhysicalCombatValues = {
    recoil: new SchemaField(SM.ModifiableValue, { required: true }),
    recoil_compensation: new SchemaField(SM.ModifiableValue, { required: true }),
}

export const MeatSpaceVisibility = {
    hasHeat: new BooleanField({ required: true, initial: false }),
}

export const AstralVisibility = {
    hasAura: new BooleanField({ required: true, initial: false }),
    astralActive: new BooleanField({ required: true, initial: false }),
    affectedBySpell: new BooleanField({ required: true, initial: false }),
}

export const MatrixVisibility = {
    hasIcon: new BooleanField({ required: true, initial: false }),
    runningSilent: new BooleanField({ required: true, initial: false }),
}

export const VisibilityChecks = {
    astral: new SchemaField(AstralVisibility, { required: true }),
    meat: new SchemaField(MeatSpaceVisibility, { required: true }),
    matrix: new SchemaField(MatrixVisibility, { required: true }),
}

export const ArmorActorData = {
    armor: new SchemaField(SM.ActorArmor, { required: true }),
}

export const WoundType = {
    value: new NumberField({ required: true, initial: 0 }),
}

export const WoundsActorData = {
    wounds: new SchemaField(SM.WoundType, { required: true }),
}

export const PhysicalTrackActorData = {
    track: new SchemaField({ physical: new SchemaField(SM.PhysicalTrack, { required: true }) }, { required: true }),
}

export const StunTrackActorData = {
    track: new SchemaField({ physical: new SchemaField(SM.StunTrack, { required: true }) }, { required: true }),
}

export const TwoTrackActorData = {
    track: new SchemaField(SM.Tracks, { required: true }),
}

export const MagicActorData = {
    magic: new SchemaField(MagicData, { required: true }),
}

export const MatrixActorData = {
    matrix: new SchemaField(MatrixData, { required: true }),
}

export const MovementActorData = {
    movement: new SchemaField(SM.Movement, { required: true }),
}

export const NPCActorData = {
    is_npc: new BooleanField({ required: true, initial: false }),
    npc: new SchemaField(NPCData, { required: true }),
}

export const CharacterLimits = {
    ...SM.AwakendLimits,
    ...SM.MatrixLimits,
}

export const CommonModifiers = {
    defense: new NumberField({ required: false, initial: 0 }),
    defense_dodge: new NumberField({ required: false, initial: 0 }),
    defense_parry: new NumberField({ required: false, initial: 0 }),
    defense_block: new NumberField({ required: false, initial: 0 }),
    defense_melee: new NumberField({ required: false, initial: 0 }),
    defense_ranged: new NumberField({ required: false, initial: 0 }),
    soak: new NumberField({ required: false, initial: 0 }),
    recoil: new NumberField({ required: false, initial: 0 }),
}

export const MatrixModifiers = {
    matrix_initiative: new NumberField({ required: false, initial: 0 }),
    matrix_initiative_dice: new NumberField({ required: false, initial: 0 }),
    matrix_track: new NumberField({ required: false, initial: 0 }),
}