import { ActionRollData } from "./Action";
import { ImportFlagData } from "../template/ImportFlags";
import { TechnologyData } from "../template/Technology";
import { DescriptionData } from "../template/Description";
const { SchemaField } = foundry.data.fields;

const EquipmentData = {
    action: new SchemaField(ActionRollData()),
    description: new SchemaField(DescriptionData()),
    importFlags: new SchemaField(ImportFlagData()),
    technology: new SchemaField(TechnologyData()),
}

export class Equipment extends foundry.abstract.TypeDataModel<typeof EquipmentData, Item.Implementation> {
    static override defineSchema() {
        return EquipmentData;
    }
}

console.log("EquipmentData", EquipmentData, new Equipment());
