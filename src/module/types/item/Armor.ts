import { SR5 } from "@/module/config";
import { BaseValuePair } from "../template/Base";
import { BaseItemData, ItemBase } from "./ItemBase";
import { TagifyMultiField } from "../fields/TagifyMultiField";
import { TechnologyPartData } from "../template/Technology";
const { SchemaField, NumberField, BooleanField, StringField } = foundry.data.fields;

export const ArmorValueData = () => ({
    accessory: new BooleanField(),
    is_hardened: new BooleanField(),
    hardened: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
    base: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
    value: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
    elements: new SchemaField({
        acid: new SchemaField(BaseValuePair()),
        cold: new SchemaField(BaseValuePair()),
        fire: new SchemaField(BaseValuePair()),
        electricity: new SchemaField(BaseValuePair()),
        radiation: new SchemaField(BaseValuePair()),
        water: new SchemaField(BaseValuePair()),
        pollutant: new SchemaField(BaseValuePair()),
    }),
    immunities: new SchemaField({
        base: new TagifyMultiField(SR5.armorImmunityTypes),
        value: new TagifyMultiField(SR5.armorImmunityTypes),
    }),
});

export const ArmorPartData = () => ({
    armor: new SchemaField(ArmorValueData()),
});

export const ArmorData = () => ({
    ...BaseItemData(),
    ...TechnologyPartData(),
    ...ArmorPartData(),

    capacity: new SchemaField({
        used: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
        total: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
    }),
});

export class Armor extends ItemBase<ReturnType<typeof ArmorData>> {
    static override defineSchema() {
        return ArmorData();
    }
    static override LOCALIZATION_PREFIXES = ["SR5.Armor", "SR5.Item"];
}

export type ArmorType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof ArmorData>>;
