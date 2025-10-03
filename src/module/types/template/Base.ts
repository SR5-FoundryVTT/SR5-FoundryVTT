const { ArrayField, BooleanField, NumberField, SchemaField, StringField } = foundry.data.fields;

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
    value: new NumberField({required: true, nullable: false, integer: true, initial: 0}),
    base: new NumberField({required: true, nullable: false, integer: true, initial: 0}),
});

export const ValueMaxPair = () => ({
    value: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
    max: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
});

export const ModListEntry = () => ({
    name: new StringField({ required: true }),
    value: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
});

export const OverrideModEntry = () => ({
    ...ModListEntry(),
});

export const NewModListEntryType = () => ({
    name: new StringField({ required: true }),
    unused: new BooleanField({ initial: false }),
    mode: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
    value: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
    priority: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
});

export const NewModList = () => new ArrayField(new SchemaField(ModListEntry()));
export const ModList = () => new ArrayField(new SchemaField(ModListEntry()));

export const ModifiableValue = () => ({
    ...BaseValuePair(),
    mod: ModList(),
    mode: new StringField({
        required: true,
        nullable: true,
        choices: ['override', 'upgrade', 'downgrade']
    }),
    changes: new ArrayField(new SchemaField(NewModListEntryType())),
    override: new SchemaField(OverrideModEntry(), { required: false, nullable: true, initial: null }),
    downgrade: new SchemaField(OverrideModEntry(), { required: false, nullable: true, initial: null }),
    upgrade: new SchemaField(OverrideModEntry(), { required: false, nullable: true, initial: null }),
    temp: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
});

export const ModifiableValueLinked = () => ({
    ...ModifiableValue(),
    attribute: new StringField({ required: true }),
    base_formula_operator: new StringField({
        required: false,
        initial: 'add',
        choices: ['add', 'subtract', 'multiply', 'divide']
    }),
});

export const ValueField = () => ({
    ...ModifiableValue(),
    label: new StringField({ required: true }),
    manualMod: new StringField({ required: true }),
});

export type ValueFieldType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof ValueField>>;
export type ModListEntryType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof ModListEntry>>;
export type BaseValuePairType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof BaseValuePair>>;
export type ModifiableValueType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof ModifiableValue>>;
export type ModifiableValueLinkedType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof ModifiableValueLinked>>;
