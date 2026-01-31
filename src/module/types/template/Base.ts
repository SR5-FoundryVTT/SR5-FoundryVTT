import { SR5 } from '@/module/config';

const { SchemaField, NumberField, ArrayField, StringField } = foundry.data.fields;

export const PhysicalAttribute = new StringField({
    choices: SR5.physicalAttributes,
});

export const MentalAttribute = new StringField({
    choices: SR5.mentalAttributes,
});

export const SpecialAttribute = new StringField({
    choices: ['edge', 'essence', 'magic', 'resonance'],
});

export const MatrixAttribute = new StringField({
    choices: SR5.matrixAttributes,
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

export const ModList = () => new ArrayField(new SchemaField(ModListEntry()));

export const ModifiableValue = () => ({
    ...BaseValuePair(),
    mod: ModList(),
    mode: new StringField({
        required: true,
        nullable: true,
        choices: ['override', 'upgrade', 'downgrade']
    }),
    override: new SchemaField(OverrideModEntry(), { required: false, nullable: true, initial: null }),
    downgrade: new SchemaField(OverrideModEntry(), { required: false, nullable: true, initial: null }),
    upgrade: new SchemaField(OverrideModEntry(), { required: false, nullable: true, initial: null }),
});

export const ModifiableValueLinked = () => ({
    ...ModifiableValue(),
    // attributes from source documents.
    attribute: new StringField({ required: true }),
    // additional attributes from item attributes when source document is an actor.
    itemAttribute: new StringField({ required: true }),
    base_formula_operator: new StringField({
        required: false,
        initial: 'add',
        choices: SR5.actionDamageFormulaOperators,
    }),
});

export const ValueField = () => ({
    ...ModifiableValue(),
    label: new StringField({ required: true }),
    manualMod: new StringField({ required: true }),
});

export type ValueFieldType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof ValueField>>;
export type BaseValuePairType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof BaseValuePair>>;
export type ModifiableValueType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof ModifiableValue>>;
export type ModifiableValueLinkedType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof ModifiableValueLinked>>;
