import { ActionPartData } from "./Action";
import { ImportFlags } from "../template/ImportFlags";
import { DescriptionPartData } from "../template/Description";
const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;

const QualityData = {
    ...DescriptionPartData(),
    ...ActionPartData(),
    ...ImportFlags(),
    type: new StringField({
        required: true,
        initial: '',
        blank: true,
        choices: ['positive', 'negative', '']
    }),
    karma: new NumberField({ required: true, nullable: false, initial: 0 }),
    rating: new NumberField({ required: true, nullable: false, initial: 0 }),
}


export class Quality extends foundry.abstract.TypeDataModel<typeof QualityData, Item.Implementation> {
    static override defineSchema() {
        return QualityData;
    }
}

console.log("QualityData", QualityData, new Quality());
