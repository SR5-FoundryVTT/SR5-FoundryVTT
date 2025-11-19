import { SR5 } from "@/module/config";
import { BaseItemData, ItemBase } from "./ItemBase";
import { TechnologyPartData } from "../template/Technology";
const { StringField } = foundry.data.fields;

const ProgramData = () => ({
    ...BaseItemData(),
    ...TechnologyPartData(),

    type: new StringField({
        required: true,
        initial: 'common_program',
        choices: SR5.programTypes
    }),
});

export class Program extends ItemBase<ReturnType<typeof ProgramData>> {
    static override defineSchema() {
        return ProgramData();
    }
}

console.log("ProgramData", ProgramData(), new Program());
