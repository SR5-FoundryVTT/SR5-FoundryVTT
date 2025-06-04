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
    value: new NumberField({required: true, nullable: false, initial: 0}),
    base: new NumberField({required: true, nullable: false, initial: 0}),
});

export const ValueMaxPair = () => ({
    value: new NumberField({ required: true, nullable: false, initial: 0 }),
    max: new NumberField({ required: true, nullable: false, initial: 0 }),
});

export const ModListEntry = () => ({
    name: new StringField({ required: true, initial: '' }),
    value: new NumberField({ required: true, nullable: false, initial: 0 }),
});

export const ModList = () => new ArrayField(new SchemaField(ModListEntry()));

export const ModifiableValue = () => ({
    ...BaseValuePair(),
    mod: ModList(),
    override: new SchemaField(ModListEntry()),
    temp: new NumberField({ required: true, nullable: false, initial: 0 }),
});

export const ModifiableValueLinked = () => ({
    ...ModifiableValue(),
    attribute: new StringField({ required: false, initial: '' }),
    base_formula_operator: new StringField({
        required: false,
        initial: 'add',
        choices: ['add', 'subtract', 'multiply', 'divide']
    }),
});

export const ValueField = () => ({
    ...ModifiableValue(),
    label: new StringField({ required: false, initial: '' }),
    manualMod: new StringField({ required: false, initial: '' }),
});

export const KeyValuePair = () => ({
    key: new StringField({ required: true, initial: '' }),
    value: new StringField({ required: true, initial: '' }),
});

export type ValueFieldType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof ValueField>>;
export type ModifiableValueType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof ModifiableValue>>;
export type ModifiableValueLinkedType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof ModifiableValueLinked>>;
