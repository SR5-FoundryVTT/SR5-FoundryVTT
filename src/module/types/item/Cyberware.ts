import { ArmorValueData } from "./Armor";
import { ActionRollData } from "./Action";
import { BaseItemData, ItemBase } from "./BaseItem";
import { TechnologyData } from "../template/Technology";
const { SchemaField, NumberField, StringField } = foundry.data.fields;

const CyberwareData = {
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

export class Cyberware extends ItemBase<typeof CyberwareData> {
    static override defineSchema() {
        return CyberwareData;
    }
}

console.log("CyberwareData", CyberwareData, new Cyberware());
