const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;
import { DataSchema } from "node_modules/fvtt-types/src/foundry/common/data/fields.mjs";
import { ShadowrunModel as SM } from "../ShadowrunModel";

export const CritterData = {
    ...SM.CommonData,
    ...SM.MagicActorData,
    ...SM.TwoTrackActorData,
    ...SM.ArmorActorData,
    ...SM.WoundsActorData,
    ...SM.MatrixActorData,
    ...SM.MovementActorData,
    ...SM.NPCActorData,
    values: new SchemaField(SM.PhysicalCombatValues, { required: true }),
    limits: new SchemaField(SM.CharacterLimits, { required: true }),
}

export class Critter extends foundry.abstract.TypeDataModel<typeof CritterData, Actor.Implementation> {
    static override defineSchema() {
        return CritterData;
    }
}
