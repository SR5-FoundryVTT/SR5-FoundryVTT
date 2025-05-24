const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;
import { ShadowrunModel as SM } from "../ShadowrunModel";

const BiowareData: DataSchema = {
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

export class Bioware extends foundry.abstract.TypeDataModel<typeof BiowareData, Item> {
    static override defineSchema(): DataSchema {
        return BiowareData;
    }
}
