import { ActionRollData } from "./Action";
import { ImportFlagData } from "../template/ImportFlags";
import { DescriptionData } from "../template/Description";
const { SchemaField, BooleanField, StringField } = foundry.data.fields;

const SpritePowerData = {
    action: new SchemaField(ActionRollData(), { required: true }),
    description: new SchemaField(DescriptionData(), { required: true }),
    importFlags: new SchemaField(ImportFlagData(), { required: true }),

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
