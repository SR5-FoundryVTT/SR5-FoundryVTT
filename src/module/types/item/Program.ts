import { ImportFlags } from "../template/ImportFlags";
import { TechnologyPartData } from "../template/Technology";
import { DescriptionPartData } from "../template/Description";
const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;

const ProgramData = {
    ...DescriptionPartData(),
    ...TechnologyPartData(),
    ...ImportFlags(),
    type: new StringField({
        required: true,
        initial: '',
        blank: true,
        choices: ['common_program', 'hacking_program', '']
    }),
}


export class Program extends foundry.abstract.TypeDataModel<typeof ProgramData, Item.Implementation> {
    static override defineSchema() {
        return ProgramData;
    }
}

console.log("ProgramData", ProgramData, new Program());
