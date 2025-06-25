import { ModifiableValue } from "./Base";
const { SchemaField, BooleanField, StringField } = foundry.data.fields;

export const LimitField = () => ({
    ...ModifiableValue(),
    attribute: new StringField({ required: false }), // Does it use it?
    label: new StringField({ required: true }),
    hidden: new BooleanField(),
});

export const Limits = () => ({
    social: new SchemaField(LimitField()),
    mental: new SchemaField(LimitField()),
    physical: new SchemaField(LimitField()),
});

export const AwakendLimits = () => ({
    astral: new SchemaField(LimitField()),
    magic: new SchemaField(LimitField()),
    initiation: new SchemaField(LimitField()),
});

export const MatrixLimits = () => ({
    attack: new SchemaField(LimitField()),
    sleaze: new SchemaField(LimitField()),
    firewall: new SchemaField(LimitField()),
    data_processing: new SchemaField(LimitField()),
});

export const VehicleLimits = () => ({
    ...Limits(),
    sensor: new SchemaField(LimitField()),
    pilot: new SchemaField(LimitField()),
    handling: new SchemaField(LimitField()),
    speed: new SchemaField(LimitField()),
    acceleration: new SchemaField(LimitField()),
});

export type LimitFieldType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof LimitField>>;
