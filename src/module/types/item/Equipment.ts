import { ActionRollData } from "./Action";
import { ImportFlagData } from "../template/ImportFlags";
import { TechnologyData } from "../template/Technology";
import { DescriptionData } from "../template/Description";
const { SchemaField } = foundry.data.fields;

const EquipmentData = {
    action: new SchemaField(ActionRollData(), { required: true }),
    description: new SchemaField(DescriptionData(), { required: true }),
    importFlags: new SchemaField(ImportFlagData(), { required: true }),
    technology: new SchemaField(TechnologyData(), { required: true }),
}

export class Equipment extends foundry.abstract.TypeDataModel<typeof EquipmentData, Item.Implementation> {
    static override defineSchema() {
        return EquipmentData;
    }
}

console.log("EquipmentData", EquipmentData, new Equipment());
