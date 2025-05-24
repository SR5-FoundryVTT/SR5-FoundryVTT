const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;
import { DataSchema } from "node_modules/fvtt-types/src/foundry/common/data/fields.mjs";
import { ShadowrunModel as SM } from "../ShadowrunModel";

export const AttributeField = {
    ...SM.BaseValuePair,
    ...SM.ModifiableValue,
    hide: new BooleanField({ required: true, initial: false }),
    label: new StringField({ required: true, initial: '' }),
    limit: new StringField({ required: false, initial: '' }),
    temp: new NumberField({ required: false, initial: 0 }),
};

const EdgeAttributeField = {
    ...AttributeField,
    uses: new NumberField({ required: true, initial: 0 }),
    max: new NumberField({ required: true, initial: 0 }),
};

//todo
export const Attributes = {
    // [name: string]: AttributeField,
    edge: new SchemaField(EdgeAttributeField)
};
