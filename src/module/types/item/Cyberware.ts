import { SR5 } from "@/module/config";
import { ArmorPartData } from "./Armor";
import { ActionPartData } from "./Action";
import { BaseItemData, ItemBase } from "./ItemBase";
import { TechnologyPartData } from "../template/Technology";
const { NumberField, StringField, SchemaField } = foundry.data.fields;

const CyberwareData = () => ({
    ...BaseItemData(),
    ...ActionPartData({ normal_weapon: true }),
    ...ArmorPartData(),
    ...TechnologyPartData(),

    essence: new NumberField({ required: true, nullable: false, initial: 0 }),
    capacity: new SchemaField({
        used: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
        total: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
    }),
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
    static override LOCALIZATION_PREFIXES = ["SR5.Item", "SR5.Armor"];
}

console.log("CyberwareData", CyberwareData(), new Cyberware());
