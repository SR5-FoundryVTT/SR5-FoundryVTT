const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;
import { DescriptionPartData } from "../template/DescriptionModel";
import { ImportFlags } from "../template/ImportFlagsModel";
import { ActionPartData } from "./ActionModel";
import { ArmorPartData } from "./ArmorModel";

const AdeptPowerData = {
    ...DescriptionPartData,
    ...ActionPartData,
    ...ImportFlags,
    ...ArmorPartData,
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
