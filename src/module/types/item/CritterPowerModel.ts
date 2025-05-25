const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;
import { ShadowrunModel as SM } from "../ShadowrunModel";

const CritterPowerData = {
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

export class CritterPower extends foundry.abstract.TypeDataModel<typeof CritterPowerData, Item.Implementation> {
    static override defineSchema() {
        return CritterPowerData;
    }
}
