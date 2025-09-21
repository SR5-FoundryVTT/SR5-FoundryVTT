import { ArmorPartData } from "./Armor";
import { ActionPartData } from "./Action";
import { BaseItemData, ItemBase } from "./ItemBase";
import { SR5 } from '@/module/config';
const { NumberField, BooleanField, StringField } = foundry.data.fields;

const AdeptPowerData = () => ({
    ...BaseItemData(),
    ...ActionPartData(),
    ...ArmorPartData(),

    pp: new NumberField({ required: true, nullable: false, initial: 0, min: 0 }),
    type: new StringField({ required: true, initial: 'passive', choices: SR5.adeptPower.types }),
    drain: new BooleanField(),
    level: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
});

export class AdeptPower extends ItemBase<ReturnType<typeof AdeptPowerData>> {
    static override defineSchema() {
        return AdeptPowerData();
    }
    static override LOCALIZATION_PREFIXES = ["SR5.AdeptPower", "SR5.Item"];
}

console.log("AdeptPowerData", AdeptPowerData(), new AdeptPower());
