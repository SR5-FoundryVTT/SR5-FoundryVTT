const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;
import { DescriptionPartData } from "../template/DescriptionModel";
import { ImportFlags } from "../template/ImportFlagsModel";

const EchoData = {
    ...DescriptionPartData(),
    ...ImportFlags()
};

export class Echo extends foundry.abstract.TypeDataModel<typeof EchoData, Item.Implementation> {
    static override defineSchema() {
        return EchoData;
    }
}
