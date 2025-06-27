import { ItemBase } from "./BaseItem";
import { TechnologyData } from "../template/Technology";
import { ImportFlagData } from "../template/ImportFlags";
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

export class Program extends ItemBase<typeof ProgramData> {
    static override defineSchema() {
        return ProgramData;
    }
}

console.log("ProgramData", ProgramData, new Program());
