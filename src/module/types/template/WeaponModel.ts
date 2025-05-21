import { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/fields.mjs";
import { ShadowrunModel as SM } from "../ShadowrunModel";

const RangeTemplateData: DataSchema = {
    ...SM.ModifiableValue,
    distance: new NumberField({ required: true, initial: 0 }),
    label: new StringField({ required: false, initial: '' }),
}

export const RangesTemplateData: DataSchema = {
    short: new SchemaField(RangeTemplateData),
    medium: new SchemaField(RangeTemplateData),
    long: new SchemaField(RangeTemplateData),
    extreme: new SchemaField(RangeTemplateData),
}

export const TargetRangeTemplateData: DataSchema = {
    tokenUuid: new StringField({ required: true, initial: '' }),
    name: new StringField({ required: true, initial: '' }),
    distance: new NumberField({ required: true, initial: 0 }),
    unit: new StringField({ required: true, initial: '' }),
    range: new SchemaField(RangeTemplateData),
}
