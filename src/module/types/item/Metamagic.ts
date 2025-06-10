import { ActionPartData } from "./Action";
import { ImportFlags } from "../template/ImportFlags";
import { DescriptionPartData } from "../template/Description";
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
