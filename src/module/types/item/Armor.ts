import { BaseItemData, ItemBase } from "./ItemBase";
import { TechnologyPartData } from "../template/Technology";
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

export const ArmorPartData = () => ({
    armor: new SchemaField(ArmorValueData()),
});

export const ArmorData = () => ({
    ...BaseItemData(),
    ...TechnologyPartData(),
    ...ArmorPartData(),
});

export class Armor extends ItemBase<ReturnType<typeof ArmorData>> {
    static override defineSchema() {
        return ArmorData();
    }
    static override LOCALIZATION_PREFIXES = ["SR5.Armor", "SR5.Item"];
}

export type ArmorType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof ArmorData>>;
export type ArmorValueType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof ArmorValueData>>;

console.log("ArmorData", ArmorData(), new Armor());
