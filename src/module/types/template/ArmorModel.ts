const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;
import { BaseValuePair, ModifiableValue } from "./BaseModel";

const ActorArmorData = () => ({
    ...ModifiableValue(),
    label: new StringField({ require: true, initial: '' }),
});

export const ActorArmor = () => ({
    ...ActorArmorData(),
    fire: new NumberField({ required: true, nullable: false, initial: 0 }),
    electric: new NumberField({ required: true, nullable: false, initial: 0 }),
    cold: new NumberField({ required: true, nullable: false, initial: 0 }),
    acid: new NumberField({ required: true, nullable: false, initial: 0 }),
    hardened: new BooleanField({ required: true, initial: false }),
});
