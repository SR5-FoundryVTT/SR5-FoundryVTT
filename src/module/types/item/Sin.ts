import { ItemBase } from "./BaseItem";
import { TechnologyData } from "../template/Technology";
import { ImportFlagData } from "../template/ImportFlags";
import { DescriptionData } from "../template/Description";
const { HTMLField, SchemaField, ArrayField, StringField } = foundry.data.fields;

const LicenseData = () => ({
    name: new StringField({ required: true }),
    rtg: new StringField({ required: true }),
    description: new HTMLField(),
});

const SinData = {
    description: new SchemaField(DescriptionData()),
    importFlags: new SchemaField(ImportFlagData()),
    technology: new SchemaField(TechnologyData()),

    licenses: new ArrayField(new SchemaField(LicenseData())),
}

export class Sin extends ItemBase<typeof SinData> {
    static override defineSchema() {
        return SinData;
    }
}

console.log("SinData", SinData, new Sin());
