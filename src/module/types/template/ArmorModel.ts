const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;
import { ModifiableValue } from "./BaseModel";

const BaseArmorData = () => ({
    ...ModifiableValue(),
    hardened: new BooleanField({ required: true, initial: false }),
    label: new StringField({ required: true, initial: '' }),
});

export const ArmorData = () => ({
    ...BaseArmorData(),
    fire: new NumberField({ required: true, nullable: false, initial: 0 }),
    electric: new NumberField({ required: true, nullable: false, initial: 0 }),
    cold: new NumberField({ required: true, nullable: false, initial: 0 }),
    acid: new NumberField({ required: true, nullable: false, initial: 0 }),
});

export type ArmorType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof ArmorData>>;
export type BaseArmorType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof BaseArmorData>>;
