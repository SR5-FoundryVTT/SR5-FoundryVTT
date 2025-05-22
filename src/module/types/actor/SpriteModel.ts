import { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/fields.mjs";
import { ShadowrunModel as SM } from "../ShadowrunModel";

const SpriteData: DataSchema = {
    ...SM.CommonData,
    ...SM.MatrixActorData,
    level: new NumberField({ required: true, initial: 0 }),
    services: new NumberField({ required: true, initial: 0 }),
    registered: new BooleanField({ required: true, initial: false }),
    spriteType: new StringField({
        required: true,
        initial: "sprite",
        choices: Object.keys(SR5CONFIG.spriteTypes),
    }),
    modifiers: new SchemaField({
        //todo
        // ...SM.Modifiers,
        ...SM.CommonModifiers,
    }, { required: true }),

    technomancerUuid: new StringField({ required: true, initial: "" }),
}

export class Sprite extends foundry.abstract.TypeDataModel<typeof SpriteData, Actor> {
    static override defineSchema(): DataSchema {
        return SpriteData;
    }
}
