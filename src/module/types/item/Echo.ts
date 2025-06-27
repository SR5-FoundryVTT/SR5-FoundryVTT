import { ItemBase } from "./BaseItem";
import { ImportFlagData } from "../template/ImportFlags";
import { DescriptionData } from "../template/Description";
const { SchemaField } = foundry.data.fields;

const EchoData = {
    description: new SchemaField(DescriptionData()),
    importFlags: new SchemaField(ImportFlagData()),
};

export class Echo extends ItemBase<typeof EchoData> {
    static override defineSchema() {
        return EchoData;
    }
}

console.log("EchoData", EchoData, new Echo());
