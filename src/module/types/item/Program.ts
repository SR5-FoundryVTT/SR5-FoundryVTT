import { ImportFlagData } from "../template/ImportFlags";
import { TechnologyData } from "../template/Technology";
import { DescriptionData } from "../template/Description";
const { SchemaField, StringField } = foundry.data.fields;

const ProgramData = {
    description: new SchemaField(DescriptionData()),
    importFlags: new SchemaField(ImportFlagData()),
    technology: new SchemaField(TechnologyData()),

    type: new StringField({
        required: true,
        initial: 'common_program',
        choices: ['common_program', 'hacking_program', 'agent']
    }),
}

export class Program extends foundry.abstract.TypeDataModel<typeof ProgramData, Item.Implementation> {
    static override defineSchema() {
        return ProgramData;
    }
}

console.log("ProgramData", ProgramData, new Program());
