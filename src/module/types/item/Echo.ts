import { ImportFlagData } from "../template/ImportFlags";
import { DescriptionData } from "../template/Description";
const { SchemaField } = foundry.data.fields;

const EchoData = {
    description: new SchemaField(DescriptionData(), { required: true }),
    importFlags: new SchemaField(ImportFlagData(), { required: true }),
};

export class Echo extends foundry.abstract.TypeDataModel<typeof EchoData, Item.Implementation> {
    static override defineSchema() {
        return EchoData;
    }
}

console.log("EchoData", EchoData, new Echo());
