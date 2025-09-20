import { BaseItemData, ItemBase } from "./ItemBase";
import { ActionPartData } from "./Action";

const MetamagicData = () => ({
    ...BaseItemData(),
    ...ActionPartData(),
});

export class Metamagic extends ItemBase<ReturnType<typeof MetamagicData>> {
    static override defineSchema() {
        return MetamagicData();
    }
}

console.log("MetamagicData", MetamagicData(), new Metamagic());
