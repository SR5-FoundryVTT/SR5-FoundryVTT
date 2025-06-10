import { BaseValuePair, ModifiableValue } from "./Base";
const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;

export const LimitField = () => ({
    ...ModifiableValue(),
    attribute: new StringField({ required: false, initial: '' }), // Does it use it?
    label: new StringField({ required: true, initial: '' }),
    hidden: new BooleanField({ required: true, initial: false }),
});

export const Limits = () => ({
    social: new SchemaField(LimitField(), { required: true }),
    mental: new SchemaField(LimitField(), { required: true }),
    physical: new SchemaField(LimitField(), { required: true }),
});

export const AwakendLimits = () => ({
    astral: new SchemaField(LimitField()),
    magic: new SchemaField(LimitField()),
    initiation: new SchemaField(LimitField()),
});

export const MatrixLimits = () => ({
    attack: new SchemaField(LimitField()),
    stealth: new SchemaField(LimitField()),
    firewall: new SchemaField(LimitField()),
    data_processing: new SchemaField(LimitField()),
});

export const VehicleLimits = () => ({
    ...Limits(),
    sensor: new SchemaField(LimitField(), { required: true }),
    pilot: new SchemaField(LimitField(), { required: true }),
    handling: new SchemaField(LimitField(), { required: true }),
    speed: new SchemaField(LimitField(), { required: true }),
    acceleration: new SchemaField(LimitField(), { required: true }),
});

export type LimitsType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof Limits>>;
export type LimitFieldType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof LimitField>>;
