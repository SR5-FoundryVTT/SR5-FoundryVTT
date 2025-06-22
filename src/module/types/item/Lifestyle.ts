import { ImportFlags } from "../template/ImportFlags";
import { DescriptionPartData } from "../template/Description";
const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;

const LifestyleData = {
    ...DescriptionPartData(),
    ...ImportFlags(),
    type: new StringField({ required: true, initial: '' }),
    comforts: new NumberField({ required: true, initial: 0 }),
    security: new NumberField({ required: true, initial: 0 }),
    neighborhood: new NumberField({ required: true, initial: 0 }),
    guests: new NumberField({ required: true, initial: 0 }),
    permanent: new BooleanField({ required: true, initial: false }),
    cost: new NumberField({ required: true, initial: 0 }),
    // todo what the hell is this?
    // mods: new ArrayField({ required: true, initial: [] }),
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
