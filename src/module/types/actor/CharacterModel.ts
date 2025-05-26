import { CommonModifiers, MatrixModifiers, CommonData, MatrixActorData, TwoTrackActorData, ArmorActorData, MagicActorData, WoundsActorData, MovementActorData, NPCActorData, PhysicalCombatValues, CharacterLimits } from "./CommonModel";
import { Attributes, AttributeField } from "../template/AttributesModel";
const { SchemaField, NumberField, BooleanField, StringField } = foundry.data.fields;

const TechnomancerActorData = () => ({
    technomancer: new SchemaField({
        attribute: new StringField({ required: true, initial: "" }),
        submersion: new NumberField({ required: true, initial: 0 }),
    }, { required: true }),
});

const CharacterAttributes = () => ({
    ...Attributes(),
    initiation: new SchemaField(AttributeField(), { required: true }),
    submersion: new SchemaField(AttributeField(), { required: true }),
});

const CharacterModifiers = () => ({
    ...CommonModifiers(),
    ...MatrixModifiers(),
    drain: new NumberField({ required: true, initial: 0 }),
    armor: new NumberField({ required: true, initial: 0 }),
    physical_limit: new NumberField({ required: true, initial: 0 }),
    astral_limit: new NumberField({ required: true, initial: 0 }),
    social_limit: new NumberField({ required: true, initial: 0 }),
    mental_limit: new NumberField({ required: true, initial: 0 }),
    stun_track: new NumberField({ required: true, initial: 0 }),
    physical_track: new NumberField({ required: true, initial: 0 }),
    physical_overflow_track: new NumberField({ required: true, initial: 0 }),
    meat_initiative: new NumberField({ required: true, initial: 0 }),
    meat_initiative_dice: new NumberField({ required: true, initial: 0 }),
    astral_initiative: new NumberField({ required: true, initial: 0 }),
    astral_initiative_dice: new NumberField({ required: true, initial: 0 }),
    composure: new NumberField({ required: true, initial: 0 }),
    lift_carry: new NumberField({ required: true, initial: 0 }),
    judge_intentions: new NumberField({ required: true, initial: 0 }),
    memory: new NumberField({ required: true, initial: 0 }),
    walk: new NumberField({ required: true, initial: 0 }),
    run: new NumberField({ required: true, initial: 0 }),
    wound_tolerance: new NumberField({ required: true, initial: 0 }),
    pain_tolerance_stun: new NumberField({ required: true, initial: 0 }),
    pain_tolerance_physical: new NumberField({ required: true, initial: 0 }),
    essence: new NumberField({ required: true, initial: 0 }),
    fade: new NumberField({ required: true, initial: 0 }),
    multi_defense: new NumberField({ required: true, initial: 0 }),
    reach: new NumberField({ required: true, initial: 0 }),
});

const CharacterData = {
    ...CommonData(),
    ...MatrixActorData(),
    ...TwoTrackActorData(),
    ...ArmorActorData(),
    ...MagicActorData(),
    ...WoundsActorData(),
    ...MovementActorData(),
    ...TechnomancerActorData(),
    ...NPCActorData(),
    attributes: new SchemaField(CharacterAttributes(), { required: true }),
    values: new SchemaField(PhysicalCombatValues(), { required: true }),
    metatype: new StringField({ required: true, initial: "" }),
    full_defense_attribute: new StringField({ required: true, initial: "" }),
    is_critter: new BooleanField({ required: true, initial: false }),
    limits: new SchemaField(CharacterLimits(), { required: true }),
    modifiers: new SchemaField({
        //todo
        // ...Modifiers,
        ...CharacterModifiers(),
    }, { required: true }),
}

console.log(CharacterData);

export class Character extends foundry.abstract.TypeDataModel<typeof CharacterData, Actor.Implementation> {
    static override defineSchema() {
        return CharacterData;
    }
}
