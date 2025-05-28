const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;
import { DescriptionPartData } from "../template/DescriptionModel";
import { ImportFlags } from "../template/ImportFlagsModel";
import { ActionPartData } from "./ActionModel";

const MetamagicData = {
    ...DescriptionPartData(),
    ...ActionPartData(),
    ...ImportFlags(),
}

console.log("MetamagicData", MetamagicData);

export class Metamagic extends foundry.abstract.TypeDataModel<typeof MetamagicData, Item.Implementation> {
    static override defineSchema() {
        return MetamagicData;
    }
}
