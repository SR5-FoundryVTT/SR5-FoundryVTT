const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;
import { ShadowrunModel as SM } from "../ShadowrunModel";

const AdeptPowerData: DataSchema = {
    ...SM.DescriptionPartData,
    ...SM.ActionPartData,
    ...SM.ImportFlags,
    ...SM.ArmorPartData,
    pp: new NumberField({ required: true, initial: 0 }),
    type: new StringField({ required: true, initial: ''}),
    drain: new BooleanField({ required: true, initial: false }),
    level: new NumberField({ required: true, initial: 0 }),
}

export class AdeptPower extends foundry.abstract.TypeDataModel<typeof AdeptPowerData, Item> {
    static override defineSchema(): DataSchema {
        return AdeptPowerData;
    }
}
