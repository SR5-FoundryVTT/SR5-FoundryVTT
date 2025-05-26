const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;
import { BaseValuePair, ModifiableValue } from "./BaseModel";

export const AttributeField = () => ({
    ...BaseValuePair(),
    ...ModifiableValue(),
    hidden: new BooleanField({ required: true, initial: false }),
    label: new StringField({ required: true, initial: '' }),
    limit: new StringField({ required: false, initial: '' }),
    temp: new NumberField({ required: false, initial: 0 }),
});

const EdgeAttributeField = () => ({
    ...AttributeField(),
    uses: new NumberField({ required: true, initial: 0 }),
    max: new NumberField({ required: true, initial: 0 }),
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

    edge: new SchemaField(EdgeAttributeField())
});

export type AttributesType = ReturnType<typeof Attributes>;