import { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/fields.mjs";
import { ShadowrunModel as SM } from "../ShadowrunModel";

const CritterPowerData: DataSchema = {
    ...SM.DescriptionPartData,
    ...SM.ActionPartData,
    ...SM.ImportFlags,
    ...SM.ArmorPartData,
    category: new StringField({
        required: true,
        initial: '',
        choices: Object.keys(SR5CONFIG.critterPower.categories),
    }),
    powerType: new StringField({
        required: true,
        initial: '',
        choices: Object.keys(SR5CONFIG.critterPower.types),
    }),
    range: new StringField({
        required: true,
        initial: '',
        choices: Object.keys(SR5CONFIG.critterPower.ranges),
    }),
    duration: new StringField({
        required: true,
        initial: '',
        choices: Object.keys(SR5CONFIG.critterPower.durations),
    }),
    karma: new NumberField({ required: true, initial: 0 }),
    rating: new NumberField({ required: true, initial: 0 }),
    optional: new StringField({
        required: true,
        initial: '',
        choices: Object.keys(SR5CONFIG.critterPower.optional),
    }),
    enabled: new BooleanField({ required: true, initial: false }),
}

export class CritterPower extends foundry.abstract.TypeDataModel<typeof CritterPowerData, Item> {
    static override defineSchema(): DataSchema {
        return CritterPowerData;
    }
}
