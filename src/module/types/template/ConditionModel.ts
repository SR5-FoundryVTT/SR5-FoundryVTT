const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;
import { ValueMaxPair } from "./BaseModel";

export const ConditionData = {
    ...ValueMaxPair,
    label: new StringField({ required: false, initial: '' }),
};
