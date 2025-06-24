import { ImportFlagData } from "../template/ImportFlags";
import { DescriptionData } from "../template/Description";
const { SchemaField, NumberField, BooleanField, StringField } = foundry.data.fields;

const LifestyleData = {
    description: new SchemaField(DescriptionData(), { required: true }),
    importFlags: new SchemaField(ImportFlagData(), { required: true }),

    type: new StringField({ required: true, initial: '' }),
    comforts: new NumberField({ required: true, initial: 0 }),
    security: new NumberField({ required: true, initial: 0 }),
    neighborhood: new NumberField({ required: true, initial: 0 }),
    guests: new NumberField({ required: true, initial: 0 }),
    permanent: new BooleanField({ required: true, initial: false }),
    cost: new NumberField({ required: true, initial: 0 }),
}

export class Lifestyle extends foundry.abstract.TypeDataModel<typeof LifestyleData, Item.Implementation> {
    static override defineSchema() {
        return LifestyleData;
    }

    static override migrateData(source) {
        if (!source || typeof source !== "object" || Object.keys(source).length === 0)
            return super.migrateData(source);

        const result = source as Lifestyle['_source'];

        // Reset broken legacy data.
        if (isNaN(source.cost)) {
            result.cost = 0; // Default cost value if not set
        }

        return super.migrateData(source);
    }
}

console.log("LifestyleData", LifestyleData, new Lifestyle());
