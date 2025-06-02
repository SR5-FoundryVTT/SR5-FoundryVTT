import { CommonData, MagicActorData, TwoTrackActorData, ArmorActorData, WoundsActorData, MatrixActorData, MovementActorData, NPCActorData, PhysicalCombatValues, CharacterLimits, CommonModifiers } from "./CommonModel";
const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;

export const CritterData = () => ({
    ...CommonData(),
    ...MagicActorData(),
    ...TwoTrackActorData(),
    ...ArmorActorData(),
    ...WoundsActorData(),
    ...MatrixActorData(),
    ...MovementActorData(),
    ...NPCActorData(),
    values: new SchemaField(PhysicalCombatValues(), { required: true }),
    limits: new SchemaField(CharacterLimits(), { required: true }),
    modifiers: new SchemaField({
        //todo
        // ...Modifiers,
        ...CommonModifiers(),
    }, { required: true }),
});

export class Critter extends foundry.abstract.TypeDataModel<ReturnType<typeof CritterData>, Actor.Implementation> {
    static override defineSchema() {
        return CritterData();
    }
}

console.log("CritterData", CritterData, new Critter());
