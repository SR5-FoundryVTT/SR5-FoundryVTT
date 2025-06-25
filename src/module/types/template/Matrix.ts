import { AttributeField } from "./Attributes";
import { ModifiableValue } from "./Base";
import { ConditionData } from "./Condition";

const { SchemaField, NumberField, BooleanField, AnyField, StringField, TypedObjectField } = foundry.data.fields;

export const DeviceAttribute = (initialAtt: '' | 'attack' | 'sleaze' | 'data_processing' | 'firewall') => ({
    value: new NumberField({ required: true, initial: 0 }),
    att: new StringField({
        blank: true,
        required: true,
        initial: initialAtt,
        choices: ['', 'attack', 'sleaze', 'data_processing', 'firewall'],
    }),
    editable: new BooleanField(),
});

export const MatrixAttributes = () => ({
    att1: new SchemaField(DeviceAttribute('attack')),
    att2: new SchemaField(DeviceAttribute('sleaze')),
    att3: new SchemaField(DeviceAttribute('data_processing')),
    att4: new SchemaField(DeviceAttribute('firewall')),
});

export const MatrixAttributeField = () => ({
    ...AttributeField(),
    device_att: new StringField({ required: true }),
});

export const MatrixData = () => ({
    dice: new SchemaField(ModifiableValue()),
    // TODO: taMiF check if it's used
    base: new SchemaField(ModifiableValue()),

    attack: new SchemaField(MatrixAttributeField()),
    sleaze: new SchemaField(MatrixAttributeField()),
    data_processing: new SchemaField(MatrixAttributeField()),
    firewall: new SchemaField(MatrixAttributeField()),

    condition_monitor: new SchemaField(ConditionData()),
    rating: new NumberField({ required: true, nullable: false, initial: 0 }),
    name: new StringField({ required: true }),
    // TODO: tamIf check if it's used
    device: new StringField({ required: true }),
    is_cyberdeck: new BooleanField(),
    hot_sim: new BooleanField(),
    running_silent: new BooleanField(),
    item: new AnyField({ required: false }),
    marks: new TypedObjectField(new NumberField({ required: true, nullable: false, initial: 0 })),
});

export type MatrixType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof MatrixData>>;
