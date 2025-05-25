import { CommonData, MagicActorData, TwoTrackActorData, ArmorActorData, WoundsActorData, MatrixActorData, MovementActorData, NPCActorData, PhysicalCombatValues, CharacterLimits } from "./CommonModel";
const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;

export const CritterData = {
    ...CommonData,
    ...MagicActorData,
    ...TwoTrackActorData,
    ...ArmorActorData,
    ...WoundsActorData,
    ...MatrixActorData,
    ...MovementActorData,
    ...NPCActorData,
    values: new SchemaField(PhysicalCombatValues, { required: true }),
    limits: new SchemaField(CharacterLimits, { required: true }),
}

export class Critter extends foundry.abstract.TypeDataModel<typeof CritterData, Actor.Implementation> {
    static override defineSchema() {
        return CritterData;
    }
}
