const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;
import { ModifiableValue } from "./BaseModel";

const RangeTemplateData = {
    ...ModifiableValue,
    distance: new NumberField({ required: true, initial: 0 }),
    label: new StringField({ required: false, initial: '' }),
}

export const RangesTemplateData = {
    short: new SchemaField(RangeTemplateData),
    medium: new SchemaField(RangeTemplateData),
    long: new SchemaField(RangeTemplateData),
    extreme: new SchemaField(RangeTemplateData),
}

export const TargetRangeTemplateData = {
    tokenUuid: new StringField({ required: true, initial: '' }),
    name: new StringField({ required: true, initial: '' }),
    distance: new NumberField({ required: true, initial: 0 }),
    unit: new StringField({ required: true, initial: '' }),
    range: new SchemaField(RangeTemplateData),
}
