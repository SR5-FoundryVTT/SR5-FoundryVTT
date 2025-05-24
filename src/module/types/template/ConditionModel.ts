const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;
import { ShadowrunModel as SM } from "../ShadowrunModel";

export const ConditionData: DataSchema = {
    ...SM.ValueMaxPair,
    label: new StringField({ required: false, initial: '' }),
};
