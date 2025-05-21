import { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/fields.mjs";
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
