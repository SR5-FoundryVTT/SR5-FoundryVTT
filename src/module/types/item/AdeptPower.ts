import { ArmorPartData } from "./Armor";
import { ActionPartData } from "./Action";
import { BaseItemData, ItemBase } from "./ItemBase";
const { NumberField, BooleanField, StringField } = foundry.data.fields;

const AdeptPowerData = () => ({
    ...BaseItemData(),
    ...ActionPartData(),
    ...ArmorPartData(),

    pp: new NumberField({ required: true, nullable: false, initial: 0, min: 0 }),
    type: new StringField({ required: true, initial: 'passive', choices: ['active', 'passive'] }),
    drain: new BooleanField(),
    level: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
});

export class AdeptPower extends ItemBase<ReturnType<typeof AdeptPowerData>> {
    static override defineSchema() {
        return AdeptPowerData();
    }
}

console.log("AdeptPowerData", AdeptPowerData(), new AdeptPower());
