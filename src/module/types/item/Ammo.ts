import { BlastData } from "./Weapon";
import { BaseItemData, ItemBase } from "./ItemBase";
import { TechnologyPartData } from "../template/Technology";
import { SR5 } from '@/module/config';
const { SchemaField, NumberField, BooleanField, StringField } = foundry.data.fields;

export const AmmoData = () => ({
    ...BaseItemData(),
    ...TechnologyPartData(),

    element: new StringField({
        blank: true,
        required: true,
        choices: SR5.elementTypes,
    }),
    ap: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
    damage: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
    damageType: new StringField({
        blank: true,
        required: true,
        choices: SR5.damageTypes,
    }),
    replaceDamage: new BooleanField(),
    replaceAP: new BooleanField(),
    blast: new SchemaField(BlastData()),
    accuracy: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
});

export class Ammo extends ItemBase<ReturnType<typeof AmmoData>> {
    static override defineSchema() {
        return AmmoData();
    }
    static override LOCALIZATION_PREFIXES = ["SR5.Item", "SR5.Ammo"];
}

console.log("AmmoData", AmmoData(), new Ammo());
