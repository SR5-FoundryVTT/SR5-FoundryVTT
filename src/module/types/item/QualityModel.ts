import { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/fields.mjs";
import { ShadowrunModel as SM } from "../ShadowrunModel";

const QualityData: DataSchema = {
    ...SM.DescriptionPartData,
    ...SM.ActionPartData,
    ...SM.ImportFlags,
    type: new StringField({
        required: true,
        initial: '',
        choices: ['positive', 'negative', '']
    }),
    karma: new NumberField({ required: true, initial: 0 }),
    rating: new NumberField({ required: true, initial: 0 }),
}

export class Quality extends foundry.abstract.TypeDataModel<typeof QualityData, Item> {
    static override defineSchema(): DataSchema {
        return QualityData;
    }
}
