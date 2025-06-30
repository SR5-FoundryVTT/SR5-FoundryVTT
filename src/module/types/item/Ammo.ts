import { BlastData } from "./Weapon";
import { BaseItemData, ItemBase } from "./ItemBase";
import { TechnologyData } from "../template/Technology";
const { SchemaField, NumberField, BooleanField, StringField } = foundry.data.fields;

export const AmmoData = () => ({
    ...BaseItemData(),
    technology: new SchemaField(TechnologyData()),

    element: new StringField({
        blank: true,
        required: true,
        choices: ['fire', 'cold', 'acid', 'electricity', 'radiation', ''],
    }),
    ap: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
    damage: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
    damageType: new StringField({
        blank: true,
        required: true,
        choices: ['physical', 'stun', 'matrix', ''],
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
