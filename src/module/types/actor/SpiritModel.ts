import { Attributes } from "../template/AttributesModel";
import { AwakendLimits } from "../template/LimitsModel";
import { CommonData, MagicActorData, TwoTrackActorData, ArmorActorData, WoundsActorData, MovementActorData, NPCActorData, PhysicalCombatValues, CommonModifiers } from "./CommonModel";
const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;

export const SpiritData = {
    ...CommonData,
    ...MagicActorData,
    ...TwoTrackActorData,
    ...ArmorActorData,
    ...WoundsActorData,
    ...MovementActorData,
    ...NPCActorData,
    summonerUuid: new StringField({ required: true, initial: "" }),
    values: new SchemaField(PhysicalCombatValues, { required: true }),
    spiritType: new StringField({
        required: true,
        initial: "spirit",
        choices: Object.keys(SR5CONFIG.spiritTypes),
    }),
    force: new NumberField({ required: true, initial: 0 }),
    limits: new SchemaField(AwakendLimits, { required: true }),
    services: new NumberField({ required: true, initial: 0 }),
    attributes: new SchemaField(Attributes, { required: true }),
    modifiers: new SchemaField({
        //todo
        // ...Modifiers,
        ...CommonModifiers,
    }, { required: true }),
}

export class Spirit extends foundry.abstract.TypeDataModel<typeof SpiritData, Actor.Implementation> {
    static override defineSchema() {
        return SpiritData;
    }
}
