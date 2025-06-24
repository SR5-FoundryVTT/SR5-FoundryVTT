import { ModifiableValue } from "./Base";
const { SchemaField, NumberField, BooleanField, StringField } = foundry.data.fields;

export const AttributeField = () => ({
    ...ModifiableValue(),
    hidden: new BooleanField(),
    label: new StringField({ required: true }),
    limit: new StringField({ required: false }),
});

const EdgeAttributeField = () => ({
    ...AttributeField(),
    uses: new NumberField({ required: true, nullable: false, initial: 0 }),
    max: new NumberField({ required: true, nullable: false, initial: 0 }),
});

export const Attributes = () => ({
    body: new SchemaField(AttributeField()),
    agility: new SchemaField(AttributeField()),
    reaction: new SchemaField(AttributeField()),
    strength: new SchemaField(AttributeField()),
    willpower: new SchemaField(AttributeField()),
    logic: new SchemaField(AttributeField()),
    intuition: new SchemaField(AttributeField()),
    charisma: new SchemaField(AttributeField()),
    magic: new SchemaField(AttributeField()),
    resonance: new SchemaField(AttributeField()),
    essence: new SchemaField(AttributeField()),

    edge: new SchemaField(EdgeAttributeField()),
});

export type AttributesType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof Attributes>>;
export type AttributeFieldType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof AttributeField>>;
export type EdgeAttributeFieldType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof EdgeAttributeField>>;
