import { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/fields.mjs";
import { ShadowrunModel as SM } from "../ShadowrunModel";

const ImportFlagData: DataSchema = {
    name: new StringField({ required: true, initial: '' }),
    type: new StringField({ required: true, initial: '' }),
    subType: new StringField({ required: true, initial: '' }),
    isFreshImport: new BooleanField({ required: true, initial: false }),
}

export const ImportFlags: DataSchema = {
    importFlags: new SchemaField(ImportFlagData)
}
