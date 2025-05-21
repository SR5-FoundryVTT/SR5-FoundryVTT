import { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/fields.mjs";
import { ShadowrunModel as SM } from "../ShadowrunModel";

const LifestyleData: DataSchema = {
    ...SM.DescriptionPartData,
    ...SM.ImportFlags,
    type: new StringField({ required: true, initial: '' }),
    comforts: new NumberField({ required: true, initial: 0 }),
    security: new NumberField({ required: true, initial: 0 }),
    neighborhood: new NumberField({ required: true, initial: 0 }),
    guests: new NumberField({ required: true, initial: 0 }),
    permanent: new BooleanField({ required: true, initial: false }),
    cost: new NumberField({ required: true, initial: 0 }),
    // todo what the hell is this?
    // mods: new ArrayField({ required: true, initial: [] }),
}

export class Lifestyle extends foundry.abstract.TypeDataModel<typeof LifestyleData, Item> {
    static override defineSchema(): DataSchema {
        return LifestyleData;
    }
}
