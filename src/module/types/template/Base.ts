import { SR5 } from '@/module/config';

const { ArrayField, BooleanField, DocumentUUIDField, NumberField, SchemaField, StringField } = foundry.data.fields;

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
    applied: new BooleanField({ initial: true }),
    masked: new BooleanField({ initial: false }),
    mode: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
    value: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
    priority: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
    effectUuid: new DocumentUUIDField({ required: true, nullable: true }),
});

export const ModList = () => new ArrayField(new SchemaField(ModListEntry()));

export const ModifiableValue = () => ({
    ...BaseValuePair(),
    changes: new ArrayField(new SchemaField(ModListEntry())),
});

export const ModifiableValueLinked = () => ({
    ...ModifiableValue(),
    attribute: new StringField({ required: true }),
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
export type ModListEntryType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof ModListEntry>>;
export type BaseValuePairType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof BaseValuePair>>;
export type ModifiableValueType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof ModifiableValue>>;
export type ModifiableValueLinkedType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof ModifiableValueLinked>>;
