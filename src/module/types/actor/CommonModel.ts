import { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/fields.mjs";
import { ShadowrunModel as SM } from "../ShadowrunModel";

export const CommonData: DataSchema = {
    attributes: new SchemaField(SM.Attributes, { required: true }),
    limits: new SchemaField(SM.Limits, { required: true }),
    skills: new SchemaField(SM.CharacterSkills, { required: true }),
    // special: new SchemaField(SM.SpecialTrait, { required: true }),
    initiative: new SchemaField(SM.Initiative, { required: true }),
    // modifiers: new SchemaField(SM.Modifiers, { required: true }),
    // situation_modifiers: new SchemaField(SM.SituationModifiersSourceData, { required: true }),
    values: new SchemaField(SM.CommonValues, { required: true }),
    // inventories: new SchemaField(SM.InventoriesData, { required: true }),
    visibilityChecks: new SchemaField(SM.VisibilityChecks, { required: true }),
    category_visibility: new SchemaField(SM.CategoryVisibility, { required: true }),
}

export const CharacterSkills: DataSchema = {
    //todo
    // active: new SchemaField(SM.Skills, { required: true }),
    language: new SchemaField(SM.KnowledgeSkillList, { required: true }),
    //todo
    // knowledge: new SchemaField(SM.KnowledgeSkills, { required: true }),
}

export const InitiativeType: DataSchema = {
    base: new SchemaField({
        ...SM.BaseValuePair, ...SM.ModifiableValue
    }, { required: true }),
    dice: new SchemaField({
        ...SM.BaseValuePair, ...SM.ModifiableValue,
        text: new StringField({ required: true, initial: "" }),
    }, { required: true }),
}

export const Initiative: DataSchema = {
    perception: new StringField({ required: true, initial: "" }),
    meatspace: new SchemaField(InitiativeType, { required: true }),
    astral: new SchemaField(InitiativeType, { required: true }),
    matrix: new SchemaField(InitiativeType, { required: true }),
    current: new SchemaField(InitiativeType, { required: true }),
    edge: new BooleanField({ required: false, initial: false }),
}

export const MagicData: DataSchema = {
    attribute: new StringField({
        required: true,
        initial: "magic",
        choices: ["magic", "resonance"],
    }),
    projecting: new BooleanField({ required: true, initial: false, }),
    initiation: new NumberField({ required: true, initial: 0, }),
}

export const MatrixAttribute: DataSchema = {
    att1: new SchemaField(SM.DeviceAttribute, { required: true }),
    att2: new SchemaField(SM.DeviceAttribute, { required: true }),
    att3: new SchemaField(SM.DeviceAttribute, { required: true }),
    att4: new SchemaField(SM.DeviceAttribute, { required: true }),
}

export const MatrixAttributeField: DataSchema = {
    ...SM.AttributeField,
    device_att: new StringField({
        required: true,
        initial: "att1",
        choices: ["att1", "att2", "att3", "att4"],
    }),
}

export const MatrixTrackActorData: DataSchema = {
    track: new SchemaField(SM.MatrixTracks, { required: true }),
}

export const CategoryVisibility: DataSchema = {
    default: new BooleanField({ required: true, initial: true }),
}

export const NPCData: DataSchema = {
    is_grunt: new BooleanField({ required: true, initial: false }),
    professional_rating: new NumberField({ required: true, initial: 0 }),
}

export const MatrixData: DataSchema = {
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

export const InventoryData: DataSchema = {
    name: new StringField({ required: true, initial: "" }),
    type: new StringField({ required: true, initial: "" }),
    items: new ArrayField(new StringField({ required: true, initial: "" }), { required: true }),
    showAll: new BooleanField({ required: false, initial: false }),
}

export const CommonValues: DataSchema = {
    string: new SchemaField(SM.ModifiableValue, { required: true }),
}

export const PhysicalCombatValues: DataSchema = {
    recoil: new SchemaField(SM.ModifiableValue, { required: true }),
    recoil_compensation: new SchemaField(SM.ModifiableValue, { required: true }),
}

export const MeatSpaceVisibility: DataSchema = {
    hasHeat: new BooleanField({ required: true, initial: false }),
}

export const AstralVisibility: DataSchema = {
    hasAura: new BooleanField({ required: true, initial: false }),
    astralActive: new BooleanField({ required: true, initial: false }),
    affectedBySpell: new BooleanField({ required: true, initial: false }),
}

export const MatrixVisibility: DataSchema = {
    hasIcon: new BooleanField({ required: true, initial: false }),
    runningSilent: new BooleanField({ required: true, initial: false }),
}

export const VisibilityChecks: DataSchema = {
    astral: new SchemaField(AstralVisibility, { required: true }),
    meat: new SchemaField(MeatSpaceVisibility, { required: true }),
    matrix: new SchemaField(MatrixVisibility, { required: true }),
}
