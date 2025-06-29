import { ActionRollData } from "./Action";
import { BaseItemData, ItemBase } from "./BaseItem";
const { SchemaField, BooleanField, StringField } = foundry.data.fields;

const SpritePowerData = {
    ...BaseItemData(),
    action: new SchemaField(ActionRollData()),

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
