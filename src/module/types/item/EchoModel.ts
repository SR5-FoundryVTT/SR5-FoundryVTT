const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;
import { ShadowrunModel as SM } from "../ShadowrunModel";

const EchoData = {
    ...SM.DescriptionPartData,
    ...SM.ImportFlags
};

export class Echo extends foundry.abstract.TypeDataModel<typeof EchoData, Item.Implementation> {
    static override defineSchema() {
        return EchoData;
    }
}
