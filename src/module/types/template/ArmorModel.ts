const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;
import { BaseValuePair, ModifiableValue } from "./BaseModel";

const ActorArmorData = {
    ...BaseValuePair,
    ...ModifiableValue,
    label: new StringField({ initial: '' }),
};

export const ActorArmor = {
    ...ActorArmorData,
    fire: new NumberField(),
    electric: new NumberField(),
    cold: new NumberField(),
    acid: new NumberField(),
    hardened: new BooleanField({ required: true, initial: false }),
};
