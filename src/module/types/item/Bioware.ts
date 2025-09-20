import { BaseItemData, ItemBase } from "./ItemBase";
import { ArmorPartData } from "./Armor";
import { ActionPartData } from "./Action";
import { TechnologyPartData } from "../template/Technology";
const { NumberField, StringField } = foundry.data.fields;

const BiowareData = () => ({
    ...BaseItemData(),
    ...ActionPartData(),
    ...TechnologyPartData(),
    ...ArmorPartData(),

    essence: new NumberField({ required: true, nullable: false, initial: 0 }),
    capacity: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
    grade: new StringField({
        required: true,
        initial: 'standard',
        choices: ['alpha', 'beta', 'delta', 'gamma', 'standard', 'used'],
    }),
});

export class Bioware extends ItemBase<ReturnType<typeof BiowareData>> {
    static override defineSchema() {
        return BiowareData();
    }
}

console.log("BiowareData", BiowareData(), new Bioware());
