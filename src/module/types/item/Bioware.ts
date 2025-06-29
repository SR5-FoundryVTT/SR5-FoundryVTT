import { BaseItemData, ItemBase } from "./BaseItem";
import { ArmorValueData } from "./Armor";
import { ActionRollData } from "./Action";
import { TechnologyData } from "../template/Technology";
const { SchemaField, NumberField, StringField } = foundry.data.fields;

const BiowareData = {
    ...BaseItemData(),
    action: new SchemaField(ActionRollData()),
    armor: new SchemaField(ArmorValueData()),
    technology: new SchemaField(TechnologyData()),

    essence: new NumberField({ required: true, nullable: false, initial: 0 }),
    capacity: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
    grade: new StringField({
        required: true,
        initial: 'standard',
        choices: ['alpha', 'beta', 'delta', 'gamma', 'standard', 'used'],
    }),
}

export class Bioware extends ItemBase<typeof BiowareData> {
    static override defineSchema() {
        return BiowareData;
    }
}

console.log("BiowareData", BiowareData, new Bioware());
