import { BaseValuePair, ModifiableValue } from "./Base";
const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;

export const AttributeField = () => ({
    ...ModifiableValue(),
    hidden: new BooleanField({ required: true, initial: false }),
    label: new StringField({ required: true, initial: '' }),
    limit: new StringField({ required: false, initial: '' }),
    temp: new NumberField({ required: true, nullable: false, initial: 0 })
});

const EdgeAttributeField = () => ({
    ...AttributeField(),
    uses: new NumberField({ required: true, nullable: false, initial: 0 }),
    max: new NumberField({ required: true, nullable: false, initial: 0 }),
});

export const Attributes = () => ({
    body: new SchemaField(AttributeField(), { required: true }),
    agility: new SchemaField(AttributeField(), { required: true }),
    reaction: new SchemaField(AttributeField(), { required: true }),
    strength: new SchemaField(AttributeField(), { required: true }),
    willpower: new SchemaField(AttributeField(), { required: true }),
    logic: new SchemaField(AttributeField(), { required: true }),
    intuition: new SchemaField(AttributeField(), { required: true }),
    charisma: new SchemaField(AttributeField(), { required: true }),
    magic: new SchemaField(AttributeField(), { required: true }),
    resonance: new SchemaField(AttributeField(), { required: true }),
    essence: new SchemaField(AttributeField(), { required: true }),

    edge: new SchemaField(EdgeAttributeField(), { required: true}),
});

export type AttributesType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof Attributes>>;
export type AttributeFieldType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof AttributeField>>;
export type EdgeAttributeFieldType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof EdgeAttributeField>>;
