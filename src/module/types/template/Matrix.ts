import { SR5 } from "@/module/config";
import { ConditionData } from "./Condition";
import { AttributeField } from "./Attributes";
import { ModifiableField } from "../fields/ModifiableField";

const { SchemaField, NumberField, BooleanField, AnyField, StringField, ArrayField, DocumentUUIDField } = foundry.data.fields;

const DeviceAttribute = (initialAtt: '' | keyof typeof SR5.matrixAttributes, editable: boolean) => ({
    value: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
    att: new StringField({
        blank: true,
        required: true,
        initial: initialAtt,
        choices: SR5.matrixAttributes,
    }),
    editable: new BooleanField({ initial: editable }),
});

export const MatrixAttributes = (editable: boolean) => ({
    att1: new SchemaField(DeviceAttribute('attack', editable)),
    att2: new SchemaField(DeviceAttribute('sleaze', editable)),
    att3: new SchemaField(DeviceAttribute('data_processing', editable)),
    att4: new SchemaField(DeviceAttribute('firewall', editable)),
});

export const MatrixAttributeField = () => ({
    ...AttributeField(),
    device_att: new StringField({ required: true }),
});

export const MatrixMarksTarget = () => (
    new ArrayField(new SchemaField({
        uuid: new StringField({ required: true }),
        name: new StringField({ required: true }),
        marks: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
    }))
);

export const LastGridData = () => ({
    uuid: new DocumentUUIDField()
});

// Intended for limited matrix actors, shared across all.
export const MatrixData = () => ({
    attack: new ModifiableField(MatrixAttributeField()),
    sleaze: new ModifiableField(MatrixAttributeField()),
    data_processing: new ModifiableField(MatrixAttributeField()),
    firewall: new ModifiableField(MatrixAttributeField()),

    condition_monitor: new SchemaField(ConditionData()),
    rating: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
    name: new StringField({ required: true }),
    device: new StringField({ required: true }),
    is_cyberdeck: new BooleanField(),
    vr: new BooleanField(),
    // Is this actors persona link locked?
    link_locked: new BooleanField(),
    hot_sim: new BooleanField(),
    running_silent: new BooleanField(),
    item: new AnyField({ required: false }),
    marks: MatrixMarksTarget(),
    grid: new SchemaField(LastGridData()),
    // Helper data point to indicate a network connection update.
    // This is not storing data that's used anywhere but rather is used
    // to trigger sheet renders across all user sessions when this actors
    // network connection is updated. The connection itself is stored in DataStorage.
    updatedConnections: new NumberField({ required: true, nullable: false, integer: true, initial: 0 })
})

export type MatrixType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof MatrixData>>;
export type MatrixAttributesType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof MatrixAttributes>>;
export type MatrixAttributeType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof MatrixAttributeField>>;
export type MatrixMarksType = MatrixType['marks'];
