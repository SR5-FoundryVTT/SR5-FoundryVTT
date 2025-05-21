import { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/fields.mjs";
import { ShadowrunModel as SM } from "../ShadowrunModel";

const LimitField: DataSchema = {
    ...SM.BaseValuePair,
    ...SM.ModifiableValue,
    label: new StringField({ required: false, initial: '' }),
    hide: new BooleanField({ required: false, initial: false }),
}

export const Limits: DataSchema = {
    social: new SchemaField(LimitField),
    mental: new SchemaField(LimitField),
    physical: new SchemaField(LimitField),
}

export const AwakendLimits: DataSchema = {
    astral: new SchemaField(LimitField),
    magic: new SchemaField(LimitField),
    initiation: new SchemaField(LimitField),
}

export const MatrixLimits: DataSchema = {
    attack: new SchemaField(LimitField),
    stealth: new SchemaField(LimitField),
    firewall: new SchemaField(LimitField),
    data_processing: new SchemaField(LimitField),
}
