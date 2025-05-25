const { SchemaField, NumberField, BooleanField, StringField } = foundry.data.fields;
import { DescriptionPartData } from "../template/DescriptionModel";
import { ImportFlags } from "../template/ImportFlagsModel";
import { TechnologyPartData } from "../template/TechnologyModel";
import { BlastData } from "./WeaponModel";

const AmmoData = {
    ...DescriptionPartData,
    ...TechnologyPartData,
    ...ImportFlags,
    element: new StringField({
        required: true,
        initial: '',
        choices: [
            '',
            'fire',
            'cold',
            'acid',
            'electricity',
            'radiation'
        ],
    }),
    ap: new NumberField({ required: true, initial: 0 }),
    damage: new NumberField({ required: true, initial: 0 }),
    damageType: new StringField({
        required: true,
        initial: '',
        choices: [
            'physical',
            'stun',
            'matrix',
            ''
        ],
    }),
    replaceDamage: new BooleanField({ required: true, initial: false }),
    blast: new SchemaField(BlastData, { required: true }),
    accuracy: new NumberField({ required: true, initial: 0 }),
}

export class Ammo extends foundry.abstract.TypeDataModel<typeof AmmoData, Item.Implementation> {
    static override defineSchema() {
        return AmmoData;
    }
}
