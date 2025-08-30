import { ModifiableField } from "../fields/ModifiableField";
import { AttributeField } from "./Attributes";
import { ConditionData } from "./Condition";

const { SchemaField, NumberField, BooleanField, AnyField, StringField, ArrayField, DocumentUUIDField } = foundry.data.fields;

const DeviceAttribute = (initialAtt: '' | 'attack' | 'sleaze' | 'data_processing' | 'firewall', editable: boolean) => ({
    value: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
    att: new StringField({
        blank: true,
        required: true,
        initial: initialAtt,
        choices: ['', 'attack', 'sleaze', 'data_processing', 'firewall'],
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
    control_rig_rating: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
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
    grid: new SchemaField(LastGridData())
})

export type MatrixType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof MatrixData>>;
export type MatrixAttributesType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof MatrixAttributes>>;
export type MatrixMarksType = MatrixType['marks'];
