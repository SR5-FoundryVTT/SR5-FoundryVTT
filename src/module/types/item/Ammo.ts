import { BlastData } from "./Weapon";
import { ImportFlags } from "../template/ImportFlags";
import { TechnologyPartData } from "../template/Technology";
import { DescriptionPartData } from "../template/Description";
const { SchemaField, NumberField, BooleanField, StringField } = foundry.data.fields;

export const AmmoData = () => ({
    ...DescriptionPartData(),
    ...TechnologyPartData(),
    ...ImportFlags(),
    element: new StringField({
        required: true,
        initial: '',
        blank: true,
        choices: ['', 'fire', 'cold', 'acid', 'electricity', 'radiation'],
    }),
    ap: new NumberField({ required: true, nullable: false, initial: 0 }),
    damage: new NumberField({ required: true, nullable: false, initial: 0 }),
    damageType: new StringField({
        required: true,
        initial: '',
        blank: true,
        choices: ['physical', 'stun', 'matrix', ''],
    }),
    replaceDamage: new BooleanField({ required: true, initial: false }),
    blast: new SchemaField(BlastData(), { required: true }),
    accuracy: new NumberField({ required: true, nullable: false, initial: 0 }),
});

export class Ammo extends foundry.abstract.TypeDataModel<ReturnType<typeof AmmoData>, Item.Implementation> {
    static override defineSchema() {
        return AmmoData();
    }
}

console.log("AmmoData", AmmoData(), new Ammo());
