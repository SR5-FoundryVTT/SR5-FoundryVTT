import { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/fields.mjs";
import { ShadowrunModel as SM } from "../ShadowrunModel";

const ProgramData: DataSchema = {
    ...SM.DescriptionPartData,
    ...SM.TechnologyPartData,
    ...SM.ImportFlags,
    type: new StringField({
        required: true,
        initial: '',
        choices: ['common_program', 'hacking_program', '']
    }),
}

export class Program extends foundry.abstract.TypeDataModel<typeof ProgramData, Item> {
    static override defineSchema(): DataSchema {
        return ProgramData;
    }
}
