import { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/fields.mjs";
import { ShadowrunModel as SM } from "../ShadowrunModel";

const TechnomancerActorData: DataSchema = {
    technomancer: new SchemaField({
        attribute: new StringField({ required: true, initial: "" }),
        submersion: new NumberField({ required: true, initial: 0 }),
    }, { required: true }),
}

const CharacterAttributes: DataSchema = {
    ...SM.Attributes,
    initiation: new SchemaField(SM.AttributeField, { required: true }),
    submersion: new SchemaField(SM.AttributeField, { required: true }),
}

const CharacterModifiers: DataSchema = {
    ...SM.CommonModifiers,
    ...SM.MatrixModifiers,
    drain: new NumberField({ required: false, initial: 0 }),
    armor: new NumberField({ required: false, initial: 0 }),
    physical_limit: new NumberField({ required: false, initial: 0 }),
    astral_limit: new NumberField({ required: false, initial: 0 }),
    social_limit: new NumberField({ required: false, initial: 0 }),
    mental_limit: new NumberField({ required: false, initial: 0 }),
    stun_track: new NumberField({ required: false, initial: 0 }),
    physical_track: new NumberField({ required: false, initial: 0 }),
    physical_overflow_track: new NumberField({ required: false, initial: 0 }),
    meat_initiative: new NumberField({ required: false, initial: 0 }),
    meat_initiative_dice: new NumberField({ required: false, initial: 0 }),
    astral_initiative: new NumberField({ required: false, initial: 0 }),
    astral_initiative_dice: new NumberField({ required: false, initial: 0 }),
    composure: new NumberField({ required: false, initial: 0 }),
    lift_carry: new NumberField({ required: false, initial: 0 }),
    judge_intentions: new NumberField({ required: false, initial: 0 }),
    memory: new NumberField({ required: false, initial: 0 }),
    walk: new NumberField({ required: false, initial: 0 }),
    run: new NumberField({ required: false, initial: 0 }),
    wound_tolerance: new NumberField({ required: false, initial: 0 }),
    pain_tolerance_stun: new NumberField({ required: false, initial: 0 }),
    pain_tolerance_physical: new NumberField({ required: false, initial: 0 }),
    essence: new NumberField({ required: false, initial: 0 }),
    fade: new NumberField({ required: false, initial: 0 }),
    multi_defense: new NumberField({ required: false, initial: 0 }),
    reach: new NumberField({ required: false, initial: 0 }),
}

const CharacterData: DataSchema = {
    ...SM.CommonData,
    ...SM.MatrixActorData,
    ...SM.TwoTrackActorData,
    ...SM.ArmorActorData,
    ...SM.MagicActorData,
    ...SM.WoundsActorData,
    ...SM.MovementActorData,
    ...TechnomancerActorData,
    ...SM.NPCActorData,
    attributes: new SchemaField(CharacterAttributes, { required: true }),
    values: new SchemaField(SM.PhysicalCombatValues, { required: true }),
    metatype: new StringField({ required: true, initial: "" }),
    full_defense_attribute: new StringField({ required: true, initial: "" }),
    is_critter: new BooleanField({ required: true, initial: false }),
    limits: new SchemaField(SM.CharacterLimits, { required: true }),
    modifiers: new SchemaField({
        //todo
        // ...SM.Modifiers,
        ...CharacterModifiers,
    }, { required: true }),
}

export class Character extends foundry.abstract.TypeDataModel<typeof CharacterData, Actor> {
    static override defineSchema(): DataSchema {
        return CharacterData;
    }
}
