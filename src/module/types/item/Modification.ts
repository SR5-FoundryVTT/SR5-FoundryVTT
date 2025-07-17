import { BaseItemData, ItemBase } from "./ItemBase";
import { TechnologyData } from "../template/Technology";
const { SchemaField, NumberField, StringField } = foundry.data.fields;

const ModificationData = {
    ...BaseItemData(),
    technology: new SchemaField(TechnologyData()),

    type: new StringField({
        blank: true,
        required: true,
        choices: ['weapon', 'armor', 'vehicle', 'drone']
    }),
    mount_point: new StringField({
        blank: true,
        required: true,
        choices: ['barrel', 'stock', 'top', 'side', 'internal', 'under']
    }),
    modification_category: new StringField({
        blank: true,
        required: true,
        choices: ['body', 'cosmetic', 'electromagnetic', 'power_train', 'protection', 'weapons']
    }),
    dice_pool: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: -1 }),
    accuracy: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
    rc: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
    conceal: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
    slots: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
}

export class Modification extends ItemBase<typeof ModificationData> {
    static override defineSchema() {
        return ModificationData;
    }
}

console.log("ModificationData", ModificationData, new Modification());
