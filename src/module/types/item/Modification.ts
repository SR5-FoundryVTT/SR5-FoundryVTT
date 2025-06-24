import { DescriptionData } from "../template/Description";
import { ImportFlagData } from "../template/ImportFlags";
import { TechnologyData } from "../template/Technology";
const { SchemaField, NumberField, StringField } = foundry.data.fields;

const ModificationData = {
    description: new SchemaField(DescriptionData()),
    importFlags: new SchemaField(ImportFlagData()),
    technology: new SchemaField(TechnologyData()),

    type: new StringField({
        blank: true,
        required: true,
        choices: ['weapon', 'armor', 'vehicle', 'drone', '']
    }),
    mount_point: new StringField({
        blank: true,
        required: true,
        choices: ['barrel', 'stock', 'top', 'side', 'internal', 'under', '']
    }),
    modification_category: new StringField({
        blank: true,
        required: true,
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
