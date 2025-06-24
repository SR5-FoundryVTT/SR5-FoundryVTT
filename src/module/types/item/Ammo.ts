import { BlastData } from "./Weapon";
import { ImportFlagData } from "../template/ImportFlags";
import { TechnologyData } from "../template/Technology";
import { DescriptionData } from "../template/Description";
const { SchemaField, NumberField, BooleanField, StringField } = foundry.data.fields;

export const AmmoData = () => ({
    description: new SchemaField(DescriptionData(), { required: true }),
    importFlags: new SchemaField(ImportFlagData(), { required: true }),
    technology: new SchemaField(TechnologyData(), { required: true }),

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
