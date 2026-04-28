import { SR5 } from '@/module/config';

const { ArrayField, BooleanField, NumberField, SchemaField, StringField } = foundry.data.fields;

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

/**
 * Expansion of Foundry's ActiveEffect.ChangeData.
 * The 'key' is implied by the field this is attached to, while 'mode'
 * and 'priority' follow standard CONST.ACTIVE_EFFECT_MODES behavior.
 */
export const ChangeEntry = () => ({
    // Default values for the change entry on Active Effects.
    name: new StringField({ required: true }),
    mode: new NumberField({ required: true, nullable: false, integer: true, initial: CONST.ACTIVE_EFFECT_MODES.ADD }),
    value: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
    priority: new NumberField({ required: true, nullable: false, integer: true, initial: 20 /* Standard priority for ADD */ }),

    // Can contain an ActiveEffect UUID, PDFPager source (e.g. "SR5 123"), URL or other linkable source.
    source: new StringField({ required: true, initial: '' }),
    // This field indicates whether the change is currently enabled.
    enabled: new BooleanField({ initial: true }),
    // This field can be used to mark changes that are not applied due to operation order.
    invalidated: new BooleanField({ initial: false }),
});

export const ChangeList = () => new ArrayField(new SchemaField(ChangeEntry()));

export const ModifiableValueSchema = () => ({
    ...BaseValuePair(),
    changes: new ArrayField(new SchemaField(ChangeEntry())),
});

export const ModifiableValueLinked = () => ({
    ...ModifiableValueSchema(),
    attribute: new StringField({ required: true }),
    base_formula_operator: new StringField({
        required: false,
        initial: 'add',
        choices: SR5.actionDamageFormulaOperators,
    }),
});

export const ValueField = () => ({
    ...ModifiableValueSchema(),
    label: new StringField({ required: true }),
});

export type ValueFieldType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof ValueField>>;
export type ChangeEntryType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof ChangeEntry>>;
export type BaseValuePairType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof BaseValuePair>>;
export type ModifiableValueType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof ModifiableValueSchema>>;
export type ModifiableValueLinkedType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof ModifiableValueLinked>>;
