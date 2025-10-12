import { Typed } from "../typed";
import { BlastData } from "./Weapon";
import { SR5 } from "@/module/config";
import { BaseItemData, ItemBase } from "./ItemBase";
import { TechnologyPartData } from "../template/Technology";
const { SchemaField, NumberField, BooleanField, StringField } = foundry.data.fields;

export const AmmoData = () => ({
    ...BaseItemData(),
    ...TechnologyPartData(),

    element: new StringField({
        blank: true,
        required: true,
        choices: Typed.keys(SR5.elementTypes),
    }),
    ap: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
    damage: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
    damageType: new StringField({
        blank: true,
        required: true,
        choices: Typed.keys(SR5.damageTypes),
    }),
    replaceDamage: new BooleanField(),
    blast: new SchemaField(BlastData()),
    accuracy: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
});

export class Ammo extends ItemBase<ReturnType<typeof AmmoData>> {
    static override defineSchema() {
        return AmmoData();
    }
}

console.log("AmmoData", AmmoData(), new Ammo());
