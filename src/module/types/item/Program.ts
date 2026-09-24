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
        choices: SR5.programTypes,
    }),
    autosoftType: new StringField({
        required: false,
        initial: 'clearsight',
        choices: SR5.autosoftTypes,
    }),
    targetModel: new StringField({
        required: false,
        initial: '',
    }),
    targetWeapon: new StringField({
        required: false,
        initial: '',
    }),
});

export class Program extends ItemBase<ReturnType<typeof ProgramData>> {
    static override defineSchema() {
        return ProgramData();
    }

    static override LOCALIZATION_PREFIXES = ["SR5.Program", "SR5.Item"];
}

console.log("ProgramData", ProgramData(), new Program());
