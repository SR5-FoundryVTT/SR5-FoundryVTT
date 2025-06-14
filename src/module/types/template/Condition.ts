import { ValueMaxPair } from "./Base";
const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;

export const ConditionData = () => ({
    ...ValueMaxPair(),
    label: new StringField({ required: false, initial: '' }),
});

export type ConditionType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof ConditionData>>;
