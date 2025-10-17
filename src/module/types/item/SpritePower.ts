import { SR5 } from "@/module/config";
import { ActionPartData } from "./Action";
import { BaseItemData, ItemBase } from "./ItemBase";
const { BooleanField, StringField } = foundry.data.fields;

const SpritePowerData = () => ({
    ...BaseItemData(),
    ...ActionPartData(),

    duration: new StringField({
        required: true,
        initial: 'always',
        choices: SR5.spritePower.durations
    }),
    optional: new StringField({
        required: true,
        initial: 'standard',
        choices: SR5.spritePower.optional
    }),
    enabled: new BooleanField({ initial: true }),
});

export class SpritePower extends ItemBase<ReturnType<typeof SpritePowerData>> {
    static override defineSchema() {
        return SpritePowerData();
    }
}

console.log("SpritePowerData", SpritePowerData(), new SpritePower());
