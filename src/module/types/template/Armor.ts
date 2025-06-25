import { ModifiableValue } from "./Base";
const { NumberField, BooleanField, StringField } = foundry.data.fields;

export const ActorArmorData = () => ({
    ...ModifiableValue(),
    acid: new NumberField({ required: true, nullable: false, initial: 0 }),
    cold: new NumberField({ required: true, nullable: false, initial: 0 }),
    electricity: new NumberField({ required: true, nullable: false, initial: 0 }),
    fire: new NumberField({ required: true, nullable: false, initial: 0 }),
    hardened: new BooleanField(),
    label: new StringField({ required: true }),
    radiation: new NumberField({ required: true, nullable: false, initial: 0 }),
});

export type ActorArmorType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof ActorArmorData>>;
