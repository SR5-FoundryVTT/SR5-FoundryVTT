import { ActionRollData } from "./Action";
import { BaseItemData, ItemBase } from "./ItemBase";
const { SchemaField, BooleanField, StringField } = foundry.data.fields;

const SpritePowerData = () => ({
    ...BaseItemData(),
    action: new SchemaField(ActionRollData()),

    duration: new StringField({ required: true, initial: 'always' }),
    optional: new StringField({ required: true, initial: 'standard', choices: ['standard', 'enabled_option', 'disabled_option'] }),
    enabled: new BooleanField({ initial: true }),
});

export class SpritePower extends ItemBase<ReturnType<typeof SpritePowerData>> {
    static override defineSchema() {
        return SpritePowerData();
    }
}

console.log("SpritePowerData", SpritePowerData(), new SpritePower());
