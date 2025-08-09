import { BaseItemData, ItemBase } from "./ItemBase";
import { TechnologyData } from "../template/Technology";
const { SchemaField, StringField } = foundry.data.fields;

const ProgramData = () => ({
    ...BaseItemData(),
    technology: new SchemaField(TechnologyData()),

    type: new StringField({
        required: true,
        initial: 'common_program',
        choices: ['common_program', 'hacking_program', 'agent']
    }),
});

export class Program extends ItemBase<ReturnType<typeof ProgramData>> {
    static override defineSchema() {
        return ProgramData();
    }
}

console.log("ProgramData", ProgramData(), new Program());
