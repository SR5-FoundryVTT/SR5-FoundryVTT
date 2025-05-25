const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;
import { DescriptionPartData } from "../template/DescriptionModel";
import { ImportFlags } from "../template/ImportFlagsModel";
import { TechnologyPartData } from "../template/TechnologyModel";
import { ActionPartData } from "./ActionModel";

const EquipmentData = {
    ...DescriptionPartData,
    ...TechnologyPartData,
    ...ActionPartData,
    ...ImportFlags,
}

export class Equipment extends foundry.abstract.TypeDataModel<typeof EquipmentData, Item.Implementation> {
    static override defineSchema() {
        return EquipmentData;
    }
}
