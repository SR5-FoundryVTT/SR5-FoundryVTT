import { BaseItemData, ItemBase } from "./ItemBase";
import { TechnologyData } from "../template/Technology";
const { HTMLField, SchemaField, ArrayField, NumberField, StringField } = foundry.data.fields;

export const LicenseData = () => ({
    name: new StringField({ required: true }),
    rtg: new NumberField({ required: true, nullable: false, integer: true, initial: 1, min: 0 }),
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
