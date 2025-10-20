import { SR5 } from "@/module/config";
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

export const AttributeField = (limit?: keyof typeof SR5.limits) => ({
    ...ModifiableValue(),
    hidden: new BooleanField(),
    label: new StringField({ required: true }),
    limit: new StringField({
        readonly: true,
        required: false,
        choices: Object.keys(SR5.limits) as Array<keyof typeof SR5.limits>,
        ...(limit ? { initial: limit } : {})
    }),
});

const EdgeAttributeField = () => ({
    ...AttributeField(),
    uses: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
    max: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
});

export const Attributes = () => ({
    body: new ModifiableField(AttributeField("physical")),
    agility: new ModifiableField(AttributeField("physical")),
    reaction: new ModifiableField(AttributeField("physical")),
    strength: new ModifiableField(AttributeField("physical")),
    willpower: new ModifiableField(AttributeField("mental")),
    logic: new ModifiableField(AttributeField("mental")),
    intuition: new ModifiableField(AttributeField("mental")),
    charisma: new ModifiableField(AttributeField("social")),
    magic: new ModifiableField(AttributeField("mental")),
    resonance: new ModifiableField(AttributeField("mental")),
    essence: new ModifiableField(AttributeField()),

    edge: new ModifiableField(EdgeAttributeField()),
});

// MatrixActorAttributes are all the attributes an actor should have to work in the matrix
// this was going to be named MatrixAttributes but that's taken...
export const MatrixActorAttributes = () => ({
    attack: new ModifiableField(AttributeField("attack")),
    sleaze: new ModifiableField(AttributeField("sleaze")),
    data_processing: new ModifiableField(AttributeField("data_processing")),
    firewall: new ModifiableField(AttributeField("firewall")),

    rating: new ModifiableField(AttributeField()),
})

export const TechnologyAttributes = () => ({
    willpower: new ModifiableField(AttributeField('mental')),
    logic: new ModifiableField(AttributeField('mental')),
    intuition: new ModifiableField(AttributeField('mental')),
    charisma: new ModifiableField(AttributeField('social')),
    ...MatrixActorAttributes(),
});

export type AttributesType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof Attributes>>;
export type AttributeFieldType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof AttributeField>>;
export type EdgeAttributeFieldType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof EdgeAttributeField>>;
export type TechnologyAttributesType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof TechnologyAttributes>>;
