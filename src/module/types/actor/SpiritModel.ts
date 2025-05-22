import { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/fields.mjs";
import { ShadowrunModel as SM } from "../ShadowrunModel";

export const SpiritData: DataSchema = {
    ...SM.CommonData,
    ...SM.MagicActorData,
    ...SM.TwoTrackActorData,
    ...SM.ArmorActorData,
    ...SM.WoundsActorData,
    ...SM.MovementActorData,
    ...SM.NPCActorData,
    summonerUuid: new StringField({ required: true, initial: "" }),
    values: new SchemaField(SM.PhysicalCombatValues, { required: true }),
    spiritType: new StringField({
        required: true,
        initial: "spirit",
        choices: Object.keys(SR5CONFIG.spiritTypes),
    }),
    force: new NumberField({ required: true, initial: 0 }),
    limits: new SchemaField(SM.AwakendLimits, { required: true }),
    services: new NumberField({ required: true, initial: 0 }),
    attributes: new SchemaField(SM.Attributes, { required: true }),
    modifiers: new SchemaField({
        //todo
        // ...SM.Modifiers,
        ...SM.CommonModifiers,
    }, { required: true }),
}

export class Spirit extends foundry.abstract.TypeDataModel<typeof SpiritData, Actor> {
    static override defineSchema(): DataSchema {
        return SpiritData;
    }
}
