import { ActionRollData } from "./Action";
import { ImportFlagData } from "../template/ImportFlags";
import { DescriptionData } from "../template/Description";
const { SchemaField } = foundry.data.fields;

const MetamagicData = {
    action: new SchemaField(ActionRollData(), { required: true }),
    description: new SchemaField(DescriptionData(), { required: true }),
    importFlags: new SchemaField(ImportFlagData(), { required: true }),
}

export class Metamagic extends foundry.abstract.TypeDataModel<typeof MetamagicData, Item.Implementation> {
    static override defineSchema() {
        return MetamagicData;
    }
}

console.log("MetamagicData", MetamagicData, new Metamagic());
