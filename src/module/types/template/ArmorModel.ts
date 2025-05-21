import { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/fields.mjs";
import { ShadowrunModel as SM } from "../ShadowrunModel";

const ActorArmorData: DataSchema = {
    ...SM.BaseValuePair,
    ...SM.ModifiableValue,
    label: new StringField({ initial: '' }),
};

export const ActorArmor: DataSchema = {
    ...ActorArmorData,
    fire: new NumberField(),
    electric: new NumberField(),
    cold: new NumberField(),
    acid: new NumberField(),
    hardened: new BooleanField({ required: true, initial: false }),
};
