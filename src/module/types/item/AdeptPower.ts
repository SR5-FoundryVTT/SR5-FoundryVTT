import { ArmorValueData } from "./Armor";
import { ActionRollData } from "./Action";
import { ImportFlagData } from "../template/ImportFlags";
import { DescriptionData } from "../template/Description";
const { SchemaField, NumberField, BooleanField, StringField } = foundry.data.fields;

const AdeptPowerData = {
    action: new SchemaField(ActionRollData()),
    armor: new SchemaField(ArmorValueData()),
    description: new SchemaField(DescriptionData()),
    importFlags: new SchemaField(ImportFlagData()),

    pp: new NumberField({ required: true, nullable: false, initial: 0 }),
    type: new StringField({ required: true }),
    drain: new BooleanField(),
    level: new NumberField({ required: true, nullable: false, initial: 0 }),
}

export class AdeptPower extends foundry.abstract.TypeDataModel<typeof AdeptPowerData, Item.Implementation> {
    static override defineSchema() {
        return AdeptPowerData;
    }
}

console.log("AdeptPowerData", AdeptPowerData, new AdeptPower());
