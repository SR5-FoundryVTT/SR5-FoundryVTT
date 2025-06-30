import { BaseItemData, ItemBase } from "./ItemBase";
import { ActionRollData } from "./Action";
const { SchemaField } = foundry.data.fields;

const MetamagicData = {
    ...BaseItemData(),
    action: new SchemaField(ActionRollData()),
}

export class Metamagic extends ItemBase<typeof MetamagicData> {
    static override defineSchema() {
        return MetamagicData;
    }
}

console.log("MetamagicData", MetamagicData, new Metamagic());
