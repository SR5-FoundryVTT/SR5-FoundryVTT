const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;
import { ShadowrunModel as SM } from "../ShadowrunModel";

const ModificationData = {
    ...SM.DescriptionPartData,
    ...SM.TechnologyPartData,
    ...SM.ImportFlags,
    type: new StringField({
        required: true,
        initial: '',
        choices: ['weapon', 'armor', 'vehicle', 'drone', '']
    }),
    mount_point: new StringField({
        required: true,
        initial: '',
        choices: ['barrel', 'stock', 'top', 'side', 'internal', '']
    }),
    modification_category: new StringField({
        required: true,
        initial: '',
        choices: ['body', 'cosmetic', 'electromagnetic', 'power_train', 'protection', 'weapons', '']
    }),
    dice_pool: new NumberField({ required: true, initial: 0 }),
    accuracy: new NumberField({ required: true, initial: 0 }),
    rc: new NumberField({ required: true, initial: 0 }),
    conceal: new NumberField({ required: true, initial: 0 }),
    slots: new NumberField({ required: true, initial: 0 }),
}

export class Modification extends foundry.abstract.TypeDataModel<typeof ModificationData, Item.Implementation> {
    static override defineSchema() {
        return ModificationData;
    }
}
