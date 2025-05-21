import { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/fields.mjs";
import { ShadowrunModel as SM } from "../ShadowrunModel";

const EchoData: DataSchema = {
    ...SM.DescriptionPartData,
    ...SM.ImportFlags
};

export class Echo extends foundry.abstract.TypeDataModel<typeof EchoData, Item> {
    static override defineSchema(): DataSchema {
        return EchoData;
    }
}
