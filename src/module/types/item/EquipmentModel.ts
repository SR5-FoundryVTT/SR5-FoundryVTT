const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;
import { ShadowrunModel as SM } from "../ShadowrunModel";

const EquipmentData: DataSchema = {
    ...SM.DescriptionPartData,
    ...SM.TechnologyPartData,
    ...SM.ActionPartData,
    ...SM.ImportFlags,
}

export class Equipment extends foundry.abstract.TypeDataModel<typeof EquipmentData, Item> {
    static override defineSchema(): DataSchema {
        return EquipmentData;
    }
}
