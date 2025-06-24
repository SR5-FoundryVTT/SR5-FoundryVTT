import { Action, ActionRollData } from "./Action";
import { ImportFlagData } from "../template/ImportFlags";
import { DescriptionData } from "../template/Description";
const { SchemaField, NumberField, StringField } = foundry.data.fields;

const QualityData = {
    action: new SchemaField(ActionRollData(), { required: true }),
    description: new SchemaField(DescriptionData(), { required: true }),
    importFlags: new SchemaField(ImportFlagData(), { required: true }),

    type: new StringField({
        required: true,
        initial: 'positive',
        choices: ['positive', 'negative', 'lifemodule']
    }),
    karma: new NumberField({ required: true, nullable: false, initial: 0 }),
    rating: new NumberField({ required: true, nullable: false, initial: 0 }),
}

export class Quality extends foundry.abstract.TypeDataModel<typeof QualityData, Item.Implementation> {
    static override defineSchema() {
        return QualityData;
    }

    static override migrateData(source) {
        if (!source || typeof source !== "object" || Object.keys(source).length === 0)
            return super.migrateData(source);

        Action.migrateData(source);

        const result = source as Quality['_source'];

        // Reset broken legacy data.
        if (!(QualityData.type.choices as string[]).includes(source.type))
            result.type = 'positive';

        return super.migrateData(source);
    }
}

console.log("QualityData", QualityData, new Quality());
