import { ModifiableField } from "../fields/ModifiableField";
import { ModifiableValue } from "./Base";
const { BooleanField, StringField } = foundry.data.fields;

export const LimitField = () => ({
    ...ModifiableValue(),
    attribute: new StringField({ required: false }), // Does it use it?
    label: new StringField({ required: true }),
    hidden: new BooleanField(),
});

export const Limits = () => ({
    social: new ModifiableField(LimitField()),
    mental: new ModifiableField(LimitField()),
    physical: new ModifiableField(LimitField()),
});

export const AwakendLimits = () => ({
    astral: new ModifiableField(LimitField()),
    magic: new ModifiableField(LimitField()),
    initiation: new ModifiableField(LimitField()),
});

export const MatrixLimits = () => ({
    attack: new ModifiableField(LimitField()),
    sleaze: new ModifiableField(LimitField()),
    firewall: new ModifiableField(LimitField()),
    data_processing: new ModifiableField(LimitField()),
});

export const VehicleLimits = () => ({
    ...Limits(),
    sensor: new ModifiableField(LimitField()),
    handling: new ModifiableField(LimitField()),
    speed: new ModifiableField(LimitField()),
});

export type LimitFieldType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof LimitField>>;
