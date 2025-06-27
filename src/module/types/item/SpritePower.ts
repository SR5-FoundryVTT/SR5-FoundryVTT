import { ItemBase } from "./BaseItem";
import { ActionRollData } from "./Action";
import { ImportFlagData } from "../template/ImportFlags";
import { DescriptionData } from "../template/Description";
const { SchemaField, BooleanField, StringField } = foundry.data.fields;

const SpritePowerData = {
    action: new SchemaField(ActionRollData()),
    description: new SchemaField(DescriptionData()),
    importFlags: new SchemaField(ImportFlagData()),

    duration: new StringField({ required: true, initial: 'always' }),
    optional: new StringField({ required: true, initial: 'standard' }),
    enabled: new BooleanField({ initial: true }),
}

export class SpritePower extends ItemBase<typeof SpritePowerData> {
    static override defineSchema() {
        return SpritePowerData;
    }
}

console.log("SpritePowerData", SpritePowerData, new SpritePower());
