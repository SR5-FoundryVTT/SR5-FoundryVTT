const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;

export const FireModeData = () => ({
    value: new NumberField({ required: true, nullable: false, initial: 0 }),
    label: new StringField({ required: true, initial: '' }),
    defense: new NumberField({ required: true, nullable: false, initial: 0 }),
    recoil: new BooleanField({ required: true, initial: false }),
    suppression: new BooleanField({ required: true, initial: false }),
    mode: new StringField({
        required: true,
        initial: 'single_shot',
        choices: ['single_shot', 'semi_auto', 'burst_fire', 'full_auto']
    }),
    action: new StringField({
        required: true,
        initial: 'simple',
        choices: ['free', 'simple', 'complex']
    })
});

export type SpellForceType = {
    value: number;
    reckless?: boolean;
};

export type ComplexFormLevelType = {
    value: number;
};

export type FireRangeType = {
    value: number;
};

export type FireModeType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof FireModeData>>;
