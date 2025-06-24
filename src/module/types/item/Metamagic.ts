import { ActionRollData } from "./Action";
import { ImportFlagData } from "../template/ImportFlags";
import { DescriptionData } from "../template/Description";
const { SchemaField } = foundry.data.fields;

const MetamagicData = {
    action: new SchemaField(ActionRollData()),
    description: new SchemaField(DescriptionData()),
    importFlags: new SchemaField(ImportFlagData()),
}

export class Metamagic extends foundry.abstract.TypeDataModel<typeof MetamagicData, Item.Implementation> {
    static override defineSchema() {
        return MetamagicData;
    }
}

console.log("MetamagicData", MetamagicData, new Metamagic());
