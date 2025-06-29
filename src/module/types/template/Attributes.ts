import { ModifiableSchemaField } from "../fields/ModifiableSchemaField";
import { ModifiableValue } from "./Base";
const { NumberField, BooleanField, StringField } = foundry.data.fields;

export const AttributeField = () => ({
    ...ModifiableValue(),
    hidden: new BooleanField(),
    label: new StringField({ required: true }),
    limit: new StringField({ required: false }),
});

const EdgeAttributeField = () => ({
    ...AttributeField(),
    uses: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
    max: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
});

export const Attributes = () => ({
    body: new ModifiableSchemaField(AttributeField()),
    agility: new ModifiableSchemaField(AttributeField()),
    reaction: new ModifiableSchemaField(AttributeField()),
    strength: new ModifiableSchemaField(AttributeField()),
    willpower: new ModifiableSchemaField(AttributeField()),
    logic: new ModifiableSchemaField(AttributeField()),
    intuition: new ModifiableSchemaField(AttributeField()),
    charisma: new ModifiableSchemaField(AttributeField()),
    magic: new ModifiableSchemaField(AttributeField()),
    resonance: new ModifiableSchemaField(AttributeField()),
    essence: new ModifiableSchemaField(AttributeField()),

    edge: new ModifiableSchemaField(EdgeAttributeField()),
});

export type AttributesType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof Attributes>>;
export type AttributeFieldType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof AttributeField>>;
export type EdgeAttributeFieldType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof EdgeAttributeField>>;
