import { ModifiableField } from '../fields/ModifiableField';
import { ModifiableValueSchema } from './Base';
const { SchemaField, StringField } = foundry.data.fields;

export const ActorArmorData = () => ({
    rating: new ModifiableField(ModifiableValueSchema()),
    hardened: new ModifiableField(ModifiableValueSchema()),
    elements: new SchemaField({
        acid: new ModifiableField(ModifiableValueSchema()),
        cold: new ModifiableField(ModifiableValueSchema()),
        electricity: new ModifiableField(ModifiableValueSchema()),
        fire: new ModifiableField(ModifiableValueSchema()),
        pollutant: new ModifiableField(ModifiableValueSchema()),
        radiation: new ModifiableField(ModifiableValueSchema()),
        water: new ModifiableField(ModifiableValueSchema()),
    }),
    immunities: new SchemaField({
        acid: new ModifiableField(ModifiableValueSchema()),
        cold: new ModifiableField(ModifiableValueSchema()),
        electricity: new ModifiableField(ModifiableValueSchema()),
        fire: new ModifiableField(ModifiableValueSchema()),
        pollutant: new ModifiableField(ModifiableValueSchema()),
        radiation: new ModifiableField(ModifiableValueSchema()),
        water: new ModifiableField(ModifiableValueSchema()),
        normal_weapons: new ModifiableField(ModifiableValueSchema()),
    }),
    label: new StringField({ required: true }),
});

export type ActorArmorType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof ActorArmorData>>;
