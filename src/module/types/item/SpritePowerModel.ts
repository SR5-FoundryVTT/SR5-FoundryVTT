const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;
import { DataSchema } from "node_modules/fvtt-types/src/foundry/common/data/fields.mjs";
import { ShadowrunModel as SM } from "../ShadowrunModel";
import { SR } from "../../constants";

const SpritePowerData: DataSchema = {
    ...SM.DescriptionPartData,
    ...SM.ActionPartData,
    ...SM.ImportFlags,
    duration: new StringField({
        required: true,
        initial: '',
        choices: SR5CONFIG.spritePower.durations
    }),
    optional: new StringField({
        required: true,
        initial: '',
        choices: SR5CONFIG.spritePower.optional
    }),
    enabled: new BooleanField({ required: true, initial: false }),
}

export class SpritePower extends foundry.abstract.TypeDataModel<typeof SpritePowerData, Item.Implementation> {
    static override defineSchema(): DataSchema {
        return SpritePowerData;
    }
}
