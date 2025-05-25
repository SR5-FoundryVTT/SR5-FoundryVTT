const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;
import { BaseValuePair, ModifiableValue } from "./BaseModel";

const LimitField = {
    ...BaseValuePair,
    ...ModifiableValue,
    label: new StringField({ required: false, initial: '' }),
    hide: new BooleanField({ required: false, initial: false }),
}

export const Limits = {
    social: new SchemaField(LimitField),
    mental: new SchemaField(LimitField),
    physical: new SchemaField(LimitField),
}

export const AwakendLimits = {
    astral: new SchemaField(LimitField),
    magic: new SchemaField(LimitField),
    initiation: new SchemaField(LimitField),
}

export const MatrixLimits = {
    attack: new SchemaField(LimitField),
    stealth: new SchemaField(LimitField),
    firewall: new SchemaField(LimitField),
    data_processing: new SchemaField(LimitField),
}
