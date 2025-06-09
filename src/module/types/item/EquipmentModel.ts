import { ActionPartData } from "./ActionModel";
import { ImportFlags } from "../template/ImportFlagsModel";
import { TechnologyPartData } from "../template/TechnologyModel";
import { DescriptionPartData } from "../template/DescriptionModel";
const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;

const EquipmentData = {
    ...DescriptionPartData(),
    ...TechnologyPartData(),
    ...ActionPartData(),
    ...ImportFlags(),
}


export class Equipment extends foundry.abstract.TypeDataModel<typeof EquipmentData, Item.Implementation> {
    static override defineSchema() {
        return EquipmentData;
    }
}

console.log("EquipmentData", EquipmentData, new Equipment());
