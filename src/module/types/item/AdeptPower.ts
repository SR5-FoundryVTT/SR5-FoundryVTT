import { ArmorPartData } from "./Armor";
import { ActionPartData } from "./Action";
import { ImportFlags } from "../template/ImportFlags";
import { DescriptionPartData } from "../template/Description";
const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;

const AdeptPowerData = {
    ...DescriptionPartData(),
    ...ActionPartData(),
    ...ImportFlags(),
    ...ArmorPartData(),
    pp: new NumberField({ required: true, initial: 0 }),
    type: new StringField({ required: true, initial: ''}),
    drain: new BooleanField({ required: true, initial: false }),
    level: new NumberField({ required: true, initial: 0 }),
}


export class AdeptPower extends foundry.abstract.TypeDataModel<typeof AdeptPowerData, Item.Implementation> {
    static override defineSchema() {
        return AdeptPowerData;
    }
}

console.log("AdeptPowerData", AdeptPowerData, new AdeptPower());
