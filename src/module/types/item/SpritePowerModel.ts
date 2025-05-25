const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;
import { DescriptionPartData } from "../template/DescriptionModel";
import { ImportFlags } from "../template/ImportFlagsModel";
import { ActionPartData } from "./ActionModel";

const SpritePowerData = {
    ...DescriptionPartData,
    ...ActionPartData,
    ...ImportFlags,
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
    static override defineSchema() {
        return SpritePowerData;
    }
}
