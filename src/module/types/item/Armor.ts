import { BaseItemData, ItemBase } from "./ItemBase";
import { TechnologyPartData } from "../template/Technology";
import { TagifyAltField } from "../fields/TagifyAltField";
const { SchemaField, NumberField, BooleanField, StringField } = foundry.data.fields;

export const ArmorValueData = () => ({
    mod: new BooleanField(),
    hardened: new BooleanField(),
    hardened_mystic: new BooleanField(),
    base: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
    value: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
    elements: new SchemaField({
        acid: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
        cold: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
        fire: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
        electricity: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
        radiation: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
        water: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
        pollutant: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
    }),
    immunities: new TagifyAltField(new StringField({ required: true })),
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

console.log("ArmorData", ArmorData(), new Armor());
