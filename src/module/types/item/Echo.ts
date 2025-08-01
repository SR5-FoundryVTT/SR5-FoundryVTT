import { BaseItemData, ItemBase } from "./ItemBase";

const EchoData = () => ({ ...BaseItemData() });

export class Echo extends ItemBase<ReturnType<typeof EchoData>> {
    static override defineSchema() {
        return EchoData();
    }
}

console.log("EchoData", EchoData(), new Echo());
