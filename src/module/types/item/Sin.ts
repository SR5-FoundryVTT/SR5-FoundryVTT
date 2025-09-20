import { BaseItemData, ItemBase } from "./ItemBase";
import { TechnologyPartData } from "../template/Technology";
const { HTMLField, SchemaField, ArrayField, NumberField, StringField } = foundry.data.fields;

export const LicenseData = () => ({
    name: new StringField({ required: true }),
    rtg: new NumberField({ required: true, nullable: false, integer: true, initial: 1, min: 0 }),
    description: new HTMLField(),
});

export const SinData = () => ({
    ...BaseItemData(),
    ...TechnologyPartData(),

    licenses: new ArrayField(new SchemaField(LicenseData())),
    networks: new ArrayField(new StringField({ required: true, nullable: false })),
});

export class Sin extends ItemBase<ReturnType<typeof SinData>> {
    static override defineSchema() {
        return SinData();
    }
}

console.log("SinData", SinData(), new Sin());
