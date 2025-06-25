import { TechnologyData } from "../template/Technology";
import { ImportFlagData } from "../template/ImportFlags";
import { DescriptionData } from "../template/Description";
const { SchemaField, NumberField, BooleanField } = foundry.data.fields;

export const ArmorValueData = () => ({
    base: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
    mod: new BooleanField(),
    value: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
    acid: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
    cold: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
    fire: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
    electricity: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
    radiation: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
    hardened: new BooleanField(),
});

export const ArmorData = () => ({
    armor: new SchemaField(ArmorValueData()),
    description: new SchemaField(DescriptionData()),
    importFlags: new SchemaField(ImportFlagData()),
    technology: new SchemaField(TechnologyData()),
});

export class Armor extends foundry.abstract.TypeDataModel<ReturnType<typeof ArmorData>, Item.Implementation> {
    static override defineSchema() {
        return ArmorData();
    }
}

export type ArmorType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof ArmorData>>;

console.log("ArmorData", ArmorData(), new Armor());
