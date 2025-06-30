import { BaseItemData, ItemBase } from "./ItemBase";
import { TechnologyData } from "../template/Technology";
const { HTMLField, SchemaField, ArrayField, StringField } = foundry.data.fields;

const LicenseData = () => ({
    name: new StringField({ required: true }),
    rtg: new StringField({ required: true }),
    description: new HTMLField(),
});

const SinData = {
    ...BaseItemData(),
    technology: new SchemaField(TechnologyData()),

    licenses: new ArrayField(new SchemaField(LicenseData())),
}

export class Sin extends ItemBase<typeof SinData> {
    static override defineSchema() {
        return SinData;
    }
}

console.log("SinData", SinData, new Sin());
