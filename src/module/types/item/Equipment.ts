import { BaseItemData, ItemBase } from "./ItemBase";
import { ActionPartData } from "./Action";
import { TechnologyPartData } from "../template/Technology";
import { ChemicalData } from "../template/Chemical";
const { SchemaField } = foundry.data.fields;

const EquipmentData = () => ({
    ...BaseItemData(),
    ...ActionPartData({ normal_weapon: true }),
    ...TechnologyPartData(),
    // Drugs, toxins and BTLs carried as gear, one dose per quantity.
    chemical: new SchemaField(ChemicalData()),
});

export class Equipment extends ItemBase<ReturnType<typeof EquipmentData>> {
    static override defineSchema() {
        return EquipmentData();
    }
}

console.log("EquipmentData", EquipmentData(), new Equipment());
