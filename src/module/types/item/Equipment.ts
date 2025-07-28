import { BaseItemData, ItemBase } from "./ItemBase";
import { ActionRollData } from "./Action";
import { TechnologyData } from "../template/Technology";
const { SchemaField } = foundry.data.fields;

const EquipmentData = {
    ...BaseItemData(),
    action: new SchemaField(ActionRollData()),
    technology: new SchemaField(TechnologyData()),
}

export class Equipment extends ItemBase<typeof EquipmentData> {
    static override defineSchema() {
        return EquipmentData;
    }
}

console.log("EquipmentData", EquipmentData, new Equipment());
