import { ModifiableValue } from "./Base";
const { NumberField, BooleanField, StringField } = foundry.data.fields;

const BaseArmorData = () => ({
    ...ModifiableValue(),
    hardened: new BooleanField(),
    label: new StringField({ required: true }),
});

export const ActorArmorData = () => ({
    ...BaseArmorData(),
    fire: new NumberField({ required: true, nullable: false, initial: 0 }),
    electricity: new NumberField({ required: true, nullable: false, initial: 0 }),
    cold: new NumberField({ required: true, nullable: false, initial: 0 }),
    acid: new NumberField({ required: true, nullable: false, initial: 0 }),
    radiation: new NumberField({ required: true, nullable: false, initial: 0 }),
});

export type BaseArmorType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof BaseArmorData>>;
export type ActorArmorType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof ActorArmorData>>;
