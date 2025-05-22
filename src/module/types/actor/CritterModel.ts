import { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/fields.mjs";
import { ShadowrunModel as SM } from "../ShadowrunModel";

export const CritterData: DataSchema = {
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

export class Critter extends foundry.abstract.TypeDataModel<typeof CritterData, Actor> {
    static override defineSchema(): DataSchema {
        return CritterData;
    }
}
