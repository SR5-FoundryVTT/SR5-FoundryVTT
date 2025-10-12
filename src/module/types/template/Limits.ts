import { Typed } from "../typed";
import { SR5 } from "@/module/config";
import { ModifiableValue } from "./Base";
import { ModifiableField } from "../fields/ModifiableField";
const { BooleanField, StringField } = foundry.data.fields;

export const LimitField = () => ({
    ...ModifiableValue(),
    attribute: new StringField({
        blank: true,
        required: true,
        choices: Typed.keys(SR5.limits)
    }),
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
