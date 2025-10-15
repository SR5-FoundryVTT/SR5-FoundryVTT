import { BaseItemData, ItemBase } from "./ItemBase";
import { ArmorPartData } from "./Armor";
import { ActionPartData } from "./Action";
import { TechnologyPartData } from "../template/Technology";
import { SR5 } from '@/module/config';
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
        choices: SR5.cyberwareGrades,
    }),
});

export class Bioware extends ItemBase<ReturnType<typeof BiowareData>> {
    static override defineSchema() {
        return BiowareData();
    }
    static override LOCALIZATION_PREFIXES = ["SR5.Item", "SR5.Armor"];
}

console.log("BiowareData", BiowareData(), new Bioware());
