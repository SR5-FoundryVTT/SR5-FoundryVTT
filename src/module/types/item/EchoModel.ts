const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;
import { DataSchema } from "node_modules/fvtt-types/src/foundry/common/data/fields.mjs";
import { ShadowrunModel as SM } from "../ShadowrunModel";

const EchoData: DataSchema = {
    ...SM.DescriptionPartData,
    ...SM.ImportFlags
};

export class Echo extends foundry.abstract.TypeDataModel<typeof EchoData, Item.Implementation> {
    static override defineSchema(): DataSchema {
        return EchoData;
    }
}
