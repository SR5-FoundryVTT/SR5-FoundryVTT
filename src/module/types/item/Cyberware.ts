import { ArmorPartData } from "./Armor";
import { ActionPartData } from "./Action";
import { BaseItemData, ItemBase } from "./ItemBase";
import { TechnologyPartData } from "../template/Technology";
import { SR5 } from '@/module/config';
const { NumberField, StringField } = foundry.data.fields;

const CyberwareData = () => ({
    ...BaseItemData(),
    ...ActionPartData(),
    ...ArmorPartData(),
    ...TechnologyPartData(),

    essence: new NumberField({ required: true, nullable: false, initial: 0 }),
    capacity: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
    grade: new StringField({
        required: true,
        initial: 'standard',
        choices: SR5.cyberwareGrades,
    }),
});

export class Cyberware extends ItemBase<ReturnType<typeof CyberwareData>> {
    static override defineSchema() {
        return CyberwareData();
    }
}

console.log("CyberwareData", CyberwareData(), new Cyberware());
