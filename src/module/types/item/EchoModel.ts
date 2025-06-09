import { ImportFlags } from "../template/ImportFlagsModel";
import { DescriptionPartData } from "../template/DescriptionModel";
const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;

const EchoData = {
    ...DescriptionPartData(),
    ...ImportFlags()
};


export class Echo extends foundry.abstract.TypeDataModel<typeof EchoData, Item.Implementation> {
    static override defineSchema() {
        return EchoData;
    }
}

console.log("EchoData", EchoData, new Echo());
