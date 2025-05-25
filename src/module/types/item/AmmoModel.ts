const { SchemaField, NumberField, BooleanField, StringField } = foundry.data.fields;
import { ShadowrunModel as SM } from "../ShadowrunModel";

const AmmoData = {
    ...SM.DescriptionPartData,
    ...SM.TechnologyPartData,
    ...SM.ImportFlags,
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
    blast: new SchemaField(SM.BlastData, { required: true }),
    accuracy: new NumberField({ required: true, initial: 0 }),
}

export class Ammo extends foundry.abstract.TypeDataModel<typeof AmmoData, Item.Implementation> {
    static override defineSchema() {
        return AmmoData;
    }
}
