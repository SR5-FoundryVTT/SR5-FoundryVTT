import { BaseItemData, ItemBase } from "./ItemBase";

const EchoData = { ...BaseItemData() };

export class Echo extends ItemBase<typeof EchoData> {
    static override defineSchema() {
        return EchoData;
    }
}

console.log("EchoData", EchoData, new Echo());
