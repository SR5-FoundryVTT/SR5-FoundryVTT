const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;

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

export const BaseValuePair = () => ({
    value: new NumberField({required: true, initial: 0}),
    base: new NumberField({required: true, initial: 0}),
});

export const ValueMaxPair = () => ({
    value: new NumberField({ required: true, initial: 0 }),
    max: new NumberField({ required: true, initial: 0 }),
});

export const ModListEntry = () => ({
    name: new StringField({ required: true, initial: '' }),
    value: new NumberField({ required: true, nullable: false, initial: 0 }),
});

export const ModList = () => ({
    list: new ArrayField(new SchemaField(ModListEntry()))
});

export const ModifiableValue = () => ({
    mod: new SchemaField(ModList()),
    override: new SchemaField(ModListEntry()),
    temp: new NumberField({ required: false, initial: 0 }),
});

export const ModifiableValueLinked = () => ({
    ...ModifiableValue(),
    attribute: new StringField({ required: false, initial: '' }),
    base_formula_operator: new StringField({ required: false, initial: '' }),
});

export const ValueField = () => ({
    ...BaseValuePair(),
    ...ModifiableValue(),
    label: new StringField({ required: false, initial: '' }),
    manualMod: new StringField({ required: false, initial: '' }),
});

export const KeyValuePair = () => ({
    key: new StringField({ required: true, initial: '' }),
    value: new StringField({ required: true, initial: '' }),
});
