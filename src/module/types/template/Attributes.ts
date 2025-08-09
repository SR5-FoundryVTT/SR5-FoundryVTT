import { ModifiableValue } from "./Base";
import { ModifiableField } from "../fields/ModifiableField";
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
    body: new ModifiableField(AttributeField()),
    agility: new ModifiableField(AttributeField()),
    reaction: new ModifiableField(AttributeField()),
    strength: new ModifiableField(AttributeField()),
    willpower: new ModifiableField(AttributeField()),
    logic: new ModifiableField(AttributeField()),
    intuition: new ModifiableField(AttributeField()),
    charisma: new ModifiableField(AttributeField()),
    magic: new ModifiableField(AttributeField()),
    resonance: new ModifiableField(AttributeField()),
    essence: new ModifiableField(AttributeField()),

    edge: new ModifiableField(EdgeAttributeField()),
});

export type AttributesType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof Attributes>>;
export type AttributeFieldType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof AttributeField>>;
export type EdgeAttributeFieldType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof EdgeAttributeField>>;
