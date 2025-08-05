import { BaseItemData, ItemBase } from "./ItemBase";
import { ActionPartData } from "./Action";
import { TechnologyPartData } from "../template/Technology";

const EquipmentData = () => ({
    ...BaseItemData(),
    ...ActionPartData(),
    ...TechnologyPartData(),
});

export class Equipment extends ItemBase<ReturnType<typeof EquipmentData>> {
    static override defineSchema() {
        return EquipmentData();
    }
}

console.log("EquipmentData", EquipmentData(), new Equipment());
