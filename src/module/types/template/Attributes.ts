import { SR5 } from "@/module/config";
import { ModifiableValue } from "./Base";
import { ModifiableField } from "../fields/ModifiableField";
const { NumberField, BooleanField, StringField } = foundry.data.fields;

export const AttributeField = (
    { limit, hidden = false }: { limit?: keyof typeof SR5.limits; hidden?: boolean; } = {}
) => ({
    ...ModifiableValue(),
    hidden: new BooleanField({ initial: hidden }),
    label: new StringField({ required: true }),
    limit: new StringField({
        blank: true,
        readonly: true,
        ...(limit ? { initial: limit } : {}),
        choices: limit ? { [limit]: SR5.limits[limit] } : SR5.limits,
    }),
});

const EdgeAttributeField = () => ({
    ...AttributeField(),
    uses: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
    max: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
});

export const Attributes = () => ({
    body: new ModifiableField(AttributeField({ limit: "physical" })),
    agility: new ModifiableField(AttributeField({ limit: "physical" })),
    reaction: new ModifiableField(AttributeField({ limit: "physical" })),
    strength: new ModifiableField(AttributeField({ limit: "physical" })),
    willpower: new ModifiableField(AttributeField({ limit: "mental" })),
    logic: new ModifiableField(AttributeField({ limit: "mental" })),
    intuition: new ModifiableField(AttributeField({ limit: "mental" })),
    charisma: new ModifiableField(AttributeField({ limit: "social" })),
    magic: new ModifiableField(AttributeField({ limit: "mental" })),
    resonance: new ModifiableField(AttributeField({ limit: "mental" })),
    essence: new ModifiableField(AttributeField()),

    edge: new ModifiableField(EdgeAttributeField()),
});

// MatrixActorAttributes are all the attributes an actor should have to work in the matrix
// this was going to be named MatrixAttributes but that's taken...
export const MatrixActorAttributes = () => ({
    attack: new ModifiableField(AttributeField({ limit: "attack" })),
    sleaze: new ModifiableField(AttributeField({ limit: "sleaze" })),
    data_processing: new ModifiableField(AttributeField({ limit: "data_processing" })),
    firewall: new ModifiableField(AttributeField({ limit: "firewall" })),

    rating: new ModifiableField(AttributeField()),
})

export const TechnologyAttributes = () => ({
    willpower: new ModifiableField(AttributeField({ limit: "mental" })),
    logic: new ModifiableField(AttributeField({ limit: "mental" })),
    intuition: new ModifiableField(AttributeField({ limit: "mental" })),
    charisma: new ModifiableField(AttributeField({ limit: "social" })),
    ...MatrixActorAttributes(),
});

export type AttributesType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof Attributes>>;
export type AttributeFieldType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof AttributeField>>;
export type EdgeAttributeFieldType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof EdgeAttributeField>>;
export type TechnologyAttributesType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof TechnologyAttributes>>;
