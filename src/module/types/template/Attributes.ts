import { ModifiableValue } from "./Base";
import { ModifiableField } from "../fields/ModifiableField";
const { NumberField, BooleanField, StringField } = foundry.data.fields;

export const AttributeChoices = () => ({
    body: 'SR5.AttrBody',
    agility: "SR5.AttrAgility",
    reaction: "SR5.AttrReaction",
    strength: "SR5.AttrStrength",
    willpower: "SR5.AttrWillpower",
    logic: "SR5.AttrLogic",
    intuition: "SR5.AttrIntuition",
    charisma: "SR5.AttrCharisma",
    magic: "SR5.AttrMagic",
    resonance: "SR5.AttrResonance",
    essence: "SR5.AttrEssence",

    edge: "SR5.AttrEdge",
})

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

// MatrixActorAttributes are all the attributes an actor should have to work in the matrix
// this was going to be named MatrixAttributes but that's taken...
export const MatrixActorAttributes = () => ({
    attack: new ModifiableField(AttributeField()),
    sleaze: new ModifiableField(AttributeField()),
    data_processing: new ModifiableField(AttributeField()),
    firewall: new ModifiableField(AttributeField()),

    rating: new ModifiableField(AttributeField()),
})

export const TechnologyAttributes = () => ({
    willpower: new ModifiableField(AttributeField()),
    logic: new ModifiableField(AttributeField()),
    intuition: new ModifiableField(AttributeField()),
    charisma: new ModifiableField(AttributeField()),
    ...MatrixActorAttributes(),
});

export type AttributesType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof Attributes>>;
export type AttributeFieldType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof AttributeField>>;
export type EdgeAttributeFieldType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof EdgeAttributeField>>;
export type TechnologyAttributesType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof TechnologyAttributes>>;
