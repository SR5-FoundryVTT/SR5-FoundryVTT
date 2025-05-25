const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;
import { DescriptionPartData } from "../template/DescriptionModel";
import { ImportFlags } from "../template/ImportFlagsModel";
import { TechnologyPartData } from "../template/TechnologyModel";

const ProgramData = {
    ...DescriptionPartData,
    ...TechnologyPartData,
    ...ImportFlags,
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
