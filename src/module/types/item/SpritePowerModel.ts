import { ActionPartData } from "./ActionModel";
import { ImportFlags } from "../template/ImportFlagsModel";
import { DescriptionPartData } from "../template/DescriptionModel";
const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;

const SpritePowerData = {
    ...DescriptionPartData(),
    ...ActionPartData(),
    ...ImportFlags(),
    duration: new StringField({ required: true, initial: '' }),
    optional: new StringField({ required: true, initial: '' }),
    enabled: new BooleanField({ required: true, initial: false }),
}


export class SpritePower extends foundry.abstract.TypeDataModel<typeof SpritePowerData, Item.Implementation> {
    static override defineSchema() {
        return SpritePowerData;
    }
}

console.log("SpritePowerData", SpritePowerData, new SpritePower());
