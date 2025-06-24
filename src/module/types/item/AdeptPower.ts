import { ArmorValueData } from "./Armor";
import { ActionRollData } from "./Action";
import { ImportFlagData } from "../template/ImportFlags";
import { DescriptionData } from "../template/Description";
const { SchemaField, NumberField, BooleanField, StringField } = foundry.data.fields;

const AdeptPowerData = {
    action: new SchemaField(ActionRollData(), { required: true }),
    armor: new SchemaField(ArmorValueData(), { required: true }),
    description: new SchemaField(DescriptionData(), { required: true }),
    importFlags: new SchemaField(ImportFlagData(), { required: true }),

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
