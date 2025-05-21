import { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/fields.mjs";
import { ShadowrunModel as SM } from "../ShadowrunModel";

const DescriptionData: DataSchema = {
    value: new StringField({ required: true, initial: '' }),
    chat: new StringField({ required: true, initial: '' }),
    source: new StringField({ required: true, initial: '' }),
}

export const DescriptionPartData: DataSchema = {
    description: new SchemaField(DescriptionData)
}
