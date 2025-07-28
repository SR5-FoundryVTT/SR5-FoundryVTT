import { ValueMaxPair } from "./Base";
const { StringField } = foundry.data.fields;

export const ConditionData = () => ({
    ...ValueMaxPair(),
    label: new StringField({ required: false }),
});

export type ConditionType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof ConditionData>>;
