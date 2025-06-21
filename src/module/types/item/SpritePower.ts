import { ActionPartData } from "./Action";
import { ImportFlags } from "../template/ImportFlags";
import { DescriptionPartData } from "../template/Description";
const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;

const SpritePowerData = {
    ...DescriptionPartData(),
    ...ActionPartData(),
    ...ImportFlags(),
    duration: new StringField({ required: true, initial: 'always' }),
    optional: new StringField({ required: true, initial: 'standard' }),
    enabled: new BooleanField({ required: true, initial: true }),
}


export class SpritePower extends foundry.abstract.TypeDataModel<typeof SpritePowerData, Item.Implementation> {
    static override defineSchema() {
        return SpritePowerData;
    }
}

console.log("SpritePowerData", SpritePowerData, new SpritePower());
