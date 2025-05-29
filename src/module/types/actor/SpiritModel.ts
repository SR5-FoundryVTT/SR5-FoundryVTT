import { Attributes } from "../template/AttributesModel";
import { AwakendLimits } from "../template/LimitsModel";
import { CharacterModifiers } from "./CharacterModel";
import { CommonData, MagicActorData, TwoTrackActorData, ArmorActorData, WoundsActorData, MovementActorData, NPCActorData, PhysicalCombatValues, CommonModifiers, CharacterLimits } from "./CommonModel";
const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;

const SpiritData = {
    ...CommonData(),
    ...MagicActorData(),
    ...TwoTrackActorData(),
    ...ArmorActorData(),
    ...WoundsActorData(),
    ...MovementActorData(),
    ...NPCActorData(),
    summonerUuid: new StringField({ required: true, initial: "" }),
    values: new SchemaField(PhysicalCombatValues(), { required: true }),
    spiritType: new StringField({
        required: true,
        initial: "",
    }),
    force: new NumberField({ required: true, nullable: false, initial: 0 }),
    limits: new SchemaField(CharacterLimits(), { required: true }),
    services: new NumberField({ required: true, nullable: false, initial: 0 }),
    attributes: new SchemaField(Attributes(), { required: true }),
    modifiers: new SchemaField({
        //todo
        // ...Modifiers,
        ...CharacterModifiers(),
    }, { required: true }),
}


export class Spirit extends foundry.abstract.TypeDataModel<typeof SpiritData, Actor.Implementation> {
    static override defineSchema() {
        return SpiritData;
    }
}

console.log("SpiritData", SpiritData, new Spirit());
