const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;
import { DescriptionPartData } from "../template/DescriptionModel";
import { ImportFlags } from "../template/ImportFlagsModel";
import { ActionPartData } from "./ActionModel";
import { ArmorPartData } from "./ArmorModel";

const CritterPowerData = {
    ...DescriptionPartData(),
    ...ActionPartData(),
    ...ImportFlags(),
    ...ArmorPartData(),
    category: new StringField({
        required: true,
        initial: '',
    }),
    powerType: new StringField({
        required: true,
        initial: '',
    }),
    range: new StringField({
        required: true,
        initial: '',
    }),
    duration: new StringField({
        required: true,
        initial: '',
    }),
    karma: new NumberField({ required: true, initial: 0 }),
    rating: new NumberField({ required: true, initial: 0 }),
    optional: new StringField({
        required: true,
        initial: '',
    }),
    enabled: new BooleanField({ required: true, initial: false }),
}

export class CritterPower extends foundry.abstract.TypeDataModel<typeof CritterPowerData, Item.Implementation> {
    static override defineSchema() {
        return CritterPowerData;
    }
}
