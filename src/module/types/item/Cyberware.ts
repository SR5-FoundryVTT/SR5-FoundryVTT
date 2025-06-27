import { ItemBase } from "./BaseItem";
import { ArmorValueData } from "./Armor";
import { ActionRollData } from "./Action";
import { ImportFlagData } from "../template/ImportFlags";
import { TechnologyData } from "../template/Technology";
import { DescriptionData } from "../template/Description";
const { SchemaField, NumberField, StringField } = foundry.data.fields;

const CyberwareData = {
    action: new SchemaField(ActionRollData()),
    armor: new SchemaField(ArmorValueData()),
    description: new SchemaField(DescriptionData()),
    importFlags: new SchemaField(ImportFlagData()),
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
