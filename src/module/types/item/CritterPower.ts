import { ArmorPartData } from "./Armor";
import { ActionPartData } from "./Action";
import { BaseItemData, ItemBase } from "./ItemBase";
import { Typed } from "../typed";
import { SR5 } from "@/module/config";
const { NumberField, BooleanField, StringField } = foundry.data.fields;

export const CritterPowerCategories = Typed.keys(SR5.critterPower.categories);

const CritterPowerData = () => ({
    ...BaseItemData(),
    ...ActionPartData(),
    ...ArmorPartData(),

    category: new StringField({
        blank: true,
        required: true,
        choices: CritterPowerCategories,
    }),
    powerType: new StringField({ required: true }),
    range: new StringField({
        required: true,
        initial: "los",
        choices: Typed.keys(SR5.critterPower.ranges)
    }),
    duration: new StringField({
        required: true,
        initial: "always",
        choices: Typed.keys(SR5.critterPower.durations)
    }),
    karma: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
    rating: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
    optional: new StringField({
        required: true,
        initial: "standard",
        choices: Typed.keys(SR5.critterPower.optional)
    }),
    enabled: new BooleanField({ initial: true }),
});

export class CritterPower extends ItemBase<ReturnType<typeof CritterPowerData>> {
    static override defineSchema() {
        return CritterPowerData();
    }
}

console.log("CritterPowerData", CritterPowerData(), new CritterPower());
