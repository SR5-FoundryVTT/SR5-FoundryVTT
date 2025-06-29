import { ActionRollData } from "./Action";
import { BaseItemData, ItemBase } from "./BaseItem";
const { SchemaField, NumberField, StringField } = foundry.data.fields;

const QualityData = {
    ...BaseItemData(),
    action: new SchemaField(ActionRollData()),

    type: new StringField({
        required: true,
        initial: 'positive',
        choices: ['positive', 'negative', 'lifemodule']
    }),
    karma: new NumberField({ required: true, nullable: false, initial: 0 }),
    rating: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
}

export class Quality extends ItemBase<typeof QualityData> {
    static override defineSchema() {
        return QualityData;
    }
}

console.log("QualityData", QualityData, new Quality());
