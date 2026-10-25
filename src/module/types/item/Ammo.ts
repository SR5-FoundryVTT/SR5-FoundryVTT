import { BlastData } from "./Weapon";
import { SR5 } from "@/module/config";
import { BaseItemData, ItemBase } from "./ItemBase";
import { TechnologyPartData } from "../template/Technology";
import { ChemicalData } from "../template/Chemical";
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
    normal_weapon: new BooleanField({ initial: true }),
    // A toxin or drug delivered by a hit, like injection darts or capsule rounds. A copy of the
    // chemical when loaded, it doesn't change with the item it came from.
    payload: new SchemaField({
        ...ChemicalData(),
        // Informational only, the payload never reads it back.
        sourceUuid: new StringField({ required: true, blank: true }),
    }),
});

export class Ammo extends ItemBase<ReturnType<typeof AmmoData>> {
    static override defineSchema() {
        return AmmoData();
    }
    static override LOCALIZATION_PREFIXES = ["SR5.Item", "SR5.Ammo"];
}

console.log("AmmoData", AmmoData(), new Ammo());
