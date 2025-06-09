import { ActionPartData } from "./ActionModel";
import { ImportFlags } from "../template/ImportFlagsModel";
import { DescriptionPartData } from "../template/DescriptionModel";
const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;

const MetamagicData = {
    ...DescriptionPartData(),
    ...ActionPartData(),
    ...ImportFlags(),
}


export class Metamagic extends foundry.abstract.TypeDataModel<typeof MetamagicData, Item.Implementation> {
    static override defineSchema() {
        return MetamagicData;
    }
}

console.log("MetamagicData", MetamagicData, new Metamagic());
