import { ImportFlagData } from "../template/ImportFlags";
import { TechnologyData } from "../template/Technology";
import { DescriptionData } from "../template/Description";
const { HTMLField, SchemaField, ArrayField, StringField } = foundry.data.fields;

const LicenseData = () => ({
    name: new StringField({ required: true, initial: '' }),
    rtg: new StringField({ required: true, initial: '' }),
    description: new HTMLField({ required: true, initial: '' }),
});

const SinData = {
    description: new SchemaField(DescriptionData(), { required: true }),
    importFlags: new SchemaField(ImportFlagData(), { required: true }),
    technology: new SchemaField(TechnologyData(), { required: true }),

    licenses: new ArrayField(new SchemaField(LicenseData()), { required: true, initial: [] }),
}

export class Sin extends foundry.abstract.TypeDataModel<typeof SinData, Item.Implementation> {
    static override defineSchema() {
        return SinData;
    }
}

console.log("SinData", SinData, new Sin());
