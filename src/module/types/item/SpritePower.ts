import { ActionPartData } from './Action';
import { BaseItemData, ItemBase } from "./ItemBase";
import { SR5 } from '@/module/config';
const { BooleanField, StringField } = foundry.data.fields;

const SpritePowerData = () => ({
    ...BaseItemData(),
    ...ActionPartData(),

    duration: new StringField({ required: true, initial: 'always', choices: SR5.spritePower.durations }),
    optional: new StringField({ required: true, initial: 'standard', choices: SR5.spritePower.optional }),
    enabled: new BooleanField({ initial: true }),
});

export class SpritePower extends ItemBase<ReturnType<typeof SpritePowerData>> {
    static override defineSchema() {
        return SpritePowerData();
    }
    static override LOCALIZATION_PREFIXES = ["SR5.SpritePower", "SR5.Item"];
}

export type SpritePowerType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof SpritePowerData>>;

console.log("SpritePowerData", SpritePowerData(), new SpritePower());
