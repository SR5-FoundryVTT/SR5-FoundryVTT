const { SchemaField, NumberField, StringField } = foundry.data.fields;

const RangeTemplateData = () => ({
    distance: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
    modifier: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
    label: new StringField({ required: false }),
});

export const RangesTemplateData = () => ({
    short: new SchemaField(RangeTemplateData()),
    medium: new SchemaField(RangeTemplateData()),
    long: new SchemaField(RangeTemplateData()),
    extreme: new SchemaField(RangeTemplateData()),
});

export const TargetRangeTemplateData = () => ({
    tokenUuid: new StringField({ required: true }),
    name: new StringField({ required: true }),
    distance: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
    unit: new StringField({ required: true }),
    range: new SchemaField(RangeTemplateData()),
});

export type RangeTemplateType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof RangeTemplateData>>;
export type RangesTemplateType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof RangesTemplateData>>;
export type TargetRangeTemplateType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof TargetRangeTemplateData>>;
