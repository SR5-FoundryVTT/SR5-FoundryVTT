import { SR5 } from "src/module/config";
import { CharacterModifiers } from "./Character";
import { AttributeField, Attributes } from "../template/Attributes";
import { CommonData, MagicActorData, TwoTrackActorData, ArmorActorData, WoundsActorData, MovementActorData, NPCActorData, PhysicalCombatValues, CharacterLimits } from "./Common";
const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;

const SpiritAttributes = () => ({
    ...Attributes(),
    force: new SchemaField(AttributeField(), { required: true }),
});

const SpiritData = {
    ...CommonData(),
    ...MagicActorData(),
    ...TwoTrackActorData(),
    ...ArmorActorData(),
    ...WoundsActorData(),
    ...MovementActorData(),
    ...NPCActorData(),
    full_defense_attribute: new StringField({ required: true, initial: "willpower" }),
    summonerUuid: new StringField({ required: true, initial: "" }),
    values: new SchemaField(PhysicalCombatValues(), { required: true }),
    spiritType: new StringField({ required: true, initial: "", }), // list all types?
    force: new NumberField({ required: true, nullable: false, initial: 0 }),
    limits: new SchemaField(CharacterLimits(), { required: true }),
    services: new NumberField({ required: true, nullable: false, initial: 0 }),
    attributes: new SchemaField(SpiritAttributes(), { required: true }),
    bound: new BooleanField({ required: true, initial: false }),
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
