const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;
import { ShadowrunModel as SM } from "../ShadowrunModel";

const QualityData = {
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

export class Quality extends foundry.abstract.TypeDataModel<typeof QualityData, Item.Implementation> {
    static override defineSchema() {
        return QualityData;
    }
}
