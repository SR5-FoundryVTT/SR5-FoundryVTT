import { CommonData, MatrixActorData, CommonModifiers } from "./Common";
const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;

const SpriteData = {
    ...CommonData(),
    ...MatrixActorData(),
    full_defense_attribute: new StringField({ required: true, initial: "willpower" }),
    level: new NumberField({ required: true, nullable: false, initial: 0 }),
    services: new NumberField({ required: true, nullable: false, initial: 0 }),
    registered: new BooleanField({ required: true, initial: false }),
    special: new StringField({ required: true, blank: true, choices: ['magic', 'resonance', 'mundane', ''], initial: 'resonance' }),
    spriteType: new StringField({
        required: true,
        initial: "",
    }),
    modifiers: new SchemaField({
        //todo
        // ...Modifiers,
        ...CommonModifiers(),
    }, { required: true }),

    technomancerUuid: new StringField({ required: true, initial: "" }),
}


export class Sprite extends foundry.abstract.TypeDataModel<typeof SpriteData, Actor.Implementation> {
    static override defineSchema() {
        return SpriteData;
    }
}

console.log("SpriteData", SpriteData, new Sprite());
