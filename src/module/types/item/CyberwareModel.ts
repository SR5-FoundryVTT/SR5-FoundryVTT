const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;
import { DataSchema } from "node_modules/fvtt-types/src/foundry/common/data/fields.mjs";
import { ShadowrunModel as SM } from "../ShadowrunModel";

const CyberwareData: DataSchema = {
    ...SM.DescriptionPartData,
    ...SM.TechnologyPartData,
    ...SM.ActionPartData,
    ...SM.ImportFlags,
    ...SM.ArmorPartData,
    essence: new NumberField({ required: true, initial: 0 }),
    capacity: new NumberField({ required: true, initial: 0 }),
    grade: new StringField({
        required: true,
        initial: '',
        choices: ['alpha', 'beta', 'delta', 'gamma', ''],
    }),
}

export class Cyberware extends foundry.abstract.TypeDataModel<typeof CyberwareData, Item.Implementation> {
    static override defineSchema(): DataSchema {
        return CyberwareData;
    }
}
