import { TechnologyData } from "../template/Technology";
import { ImportFlagData } from "../template/ImportFlags";
import { DescriptionData } from "../template/Description";
const { SchemaField, NumberField, BooleanField } = foundry.data.fields;

export const ArmorValueData = () => ({
    base: new NumberField({ required: true, nullable: false, initial: 0 }),
    mod: new BooleanField({ required: true, initial: false }),
    value: new NumberField({ required: true, nullable: false, initial: 0 }),
    acid: new NumberField({ required: true, nullable: false, initial: 0 }),
    cold: new NumberField({ required: true, nullable: false, initial: 0 }),
    fire: new NumberField({ required: true, nullable: false, initial: 0 }),
    electricity: new NumberField({ required: true, nullable: false, initial: 0 }),
    radiation: new NumberField({ required: true, nullable: false, initial: 0 }),
    hardened: new BooleanField({ required: true, initial: false }),
});

export const ArmorData = () => ({
    armor: new SchemaField(ArmorValueData(), { required: true }),
    description: new SchemaField(DescriptionData(), { required: true }),
    importFlags: new SchemaField(ImportFlagData(), { required: true }),
    technology: new SchemaField(TechnologyData(), { required: true }),
});

export class Armor extends foundry.abstract.TypeDataModel<ReturnType<typeof ArmorData>, Item.Implementation> {
    static override defineSchema() {
        return ArmorData();
    }
}

export type ArmorType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof ArmorData>>;

console.log("ArmorData", ArmorData(), new Armor());
