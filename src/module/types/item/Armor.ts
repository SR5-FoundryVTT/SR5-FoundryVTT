import { BaseItemData, ItemBase } from "./BaseItem";
import { TechnologyData } from "../template/Technology";
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
    ...BaseItemData(),
    armor: new SchemaField(ArmorValueData()),
    technology: new SchemaField(TechnologyData()),
});

export class Armor extends ItemBase<ReturnType<typeof ArmorData>> {
    static override defineSchema() {
        return ArmorData();
    }
}

export type ArmorType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof ArmorData>>;
export type ArmorValueType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof ArmorValueData>>;

console.log("ArmorData", ArmorData(), new Armor());
