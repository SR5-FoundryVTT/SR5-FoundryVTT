import { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/fields.mjs";
import { ShadowrunModel as SM } from "../ShadowrunModel";

export const AttributeField: DataSchema = {
    ...SM.BaseValuePair,
    ...SM.ModifiableValue,
    hide: new BooleanField({ required: true, initial: false }),
    label: new StringField({ required: true, initial: '' }),
    limit: new StringField({ required: false, initial: '' }),
    temp: new NumberField({ required: false, initial: 0 }),
};

const EdgeAttributeField: DataSchema = {
    ...AttributeField,
    uses: new NumberField({ required: true, initial: 0 }),
    max: new NumberField({ required: true, initial: 0 }),
};

//todo
export const Attributes: DataSchema = {
    // [name: string]: AttributeField,
    edge: new SchemaField(EdgeAttributeField)
};
