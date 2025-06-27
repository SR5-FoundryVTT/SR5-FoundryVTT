import { ItemBase } from "./BaseItem";
import { ImportFlagData } from "../template/ImportFlags";
import { DescriptionData } from "../template/Description";
const { SchemaField, NumberField, BooleanField, StringField } = foundry.data.fields;

const LifestyleData = {
    description: new SchemaField(DescriptionData()),
    importFlags: new SchemaField(ImportFlagData()),

    type: new StringField({ required: true }),
    comforts: new NumberField({ required: true, nullable: false, initial: 0 }),
    security: new NumberField({ required: true, nullable: false, initial: 0 }),
    neighborhood: new NumberField({ required: true, nullable: false, initial: 0 }),
    guests: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
    permanent: new BooleanField(),
    cost: new NumberField({ required: true, nullable: false, initial: 0 }),
}

export class Lifestyle extends ItemBase<typeof LifestyleData> {
    static override defineSchema() {
        return LifestyleData;
    }
}

console.log("LifestyleData", LifestyleData, new Lifestyle());
