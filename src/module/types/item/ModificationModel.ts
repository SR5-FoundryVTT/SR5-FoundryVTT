import { ImportFlags } from "../template/ImportFlagsModel";
import { TechnologyPartData } from "../template/TechnologyModel";
import { DescriptionPartData } from "../template/DescriptionModel";
const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;

const ModificationData = {
    ...DescriptionPartData(),
    ...TechnologyPartData(),
    ...ImportFlags(),
    type: new StringField({
        required: true,
        initial: '',
        blank: true,
        choices: ['weapon', 'armor', 'vehicle', 'drone', '']
    }),
    mount_point: new StringField({
        required: true,
        initial: '',
        blank: true,
        choices: ['barrel', 'stock', 'top', 'side', 'internal', '']
    }),
    modification_category: new StringField({
        required: true,
        initial: '',
        blank: true,
        choices: ['body', 'cosmetic', 'electromagnetic', 'power_train', 'protection', 'weapons', '']
    }),
    dice_pool: new NumberField({ required: true, nullable: false, initial: 0 }),
    accuracy: new NumberField({ required: true, nullable: false, initial: 0 }),
    rc: new NumberField({ required: true, nullable: false, initial: 0 }),
    conceal: new NumberField({ required: true, nullable: false, initial: 0 }),
    slots: new NumberField({ required: true, nullable: false, initial: 0 }),
}

export class Modification extends foundry.abstract.TypeDataModel<typeof ModificationData, Item.Implementation> {
    static override defineSchema() {
        return ModificationData;
    }
}

console.log("ModificationData", ModificationData, new Modification());
