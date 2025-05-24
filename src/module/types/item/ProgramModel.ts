const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;
import { DataSchema } from "node_modules/fvtt-types/src/foundry/common/data/fields.mjs";
import { ShadowrunModel as SM } from "../ShadowrunModel";

const ProgramData = {
    ...SM.DescriptionPartData,
    ...SM.TechnologyPartData,
    ...SM.ImportFlags,
    type: new StringField({
        required: true,
        initial: '',
        choices: ['common_program', 'hacking_program', '']
    }),
}

export class Program extends foundry.abstract.TypeDataModel<typeof ProgramData, Item.Implementation> {
    static override defineSchema() {
        return ProgramData;
    }
}
