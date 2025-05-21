import { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/fields.mjs";

export const PhysicalAttribute = new StringField({
    choices: ['body', 'agility', 'reaction', 'strength'],
});

export const MentalAttribute = new StringField({
    choices: ['logic', 'intuition', 'charisma', 'willpower'],
});

export const SpecialAttribute = new StringField({
    choices: ['edge', 'essence', 'magic', 'resonance'],
});

export const MatrixAttribute = new StringField({
    choices: ['attack', 'sleaze', 'data_processing', 'firewall'],
});

export const BaseValuePair: DataSchema = {
    base: new NumberField(),
    value: new NumberField(),
};

export const ValueMaxPair: DataSchema = {
    value: new NumberField(),
    max: new NumberField(),
};

export const ModListEntry: DataSchema = {
    name: new StringField({ required: true, initial: '' }),
    value: new NumberField({ required: true, nullable: false, initial: 0 }),
};

export const ModList: DataSchema = {
    list: new ArrayField(new SchemaField(ModListEntry))
};

export const ModifiableValue: DataSchema = {
    mod: new SchemaField(ModList),
    override: new SchemaField(ModListEntry),
    temp: new NumberField({ required: false, initial: 0 }),
};

export const ModifiableValueLinked: DataSchema = {
    ...ModifiableValue,
    attribute: new StringField({ required: false, initial: '' }),
    base_formula_operator: new StringField({ required: false, initial: '' }),
}

export const ValueField: DataSchema = {
    ...BaseValuePair,
    ...ModifiableValue,
    label: new StringField({ required: false, initial: '' }),
    manualMod: new StringField({ required: false, initial: '' }),
};

export const KeyValuePair: DataSchema = {
    key: new StringField({ required: true, initial: '' }),
    value: new StringField({ required: true, initial: '' }),
};
