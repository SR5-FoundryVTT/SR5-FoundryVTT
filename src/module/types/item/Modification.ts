import { BaseItemData, ItemBase } from "./ItemBase";
import { TechnologyPartData } from "../template/Technology";
import { SR5 } from '@/module/config';
const { NumberField, StringField } = foundry.data.fields;

const ModificationData = () => ({
    ...BaseItemData(),
    ...TechnologyPartData(),

    type: new StringField({
        blank: true,
        required: true,
        choices: SR5.modificationTypes,
    }),
    mount_point: new StringField({
        blank: true,
        required: true,
        choices: SR5.mountPoints,
    }),
    modification_category: new StringField({
        blank: true,
        required: true,
        choices: SR5.modificationCategories,
    }),
    dice_pool: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
    accuracy: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
    rc: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
    conceal: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
    slots: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
});

export class Modification extends ItemBase<ReturnType<typeof ModificationData>> {
    static override defineSchema() {
        return ModificationData();
    }
    static override LOCALIZATION_PREFIXES = ["SR5.Modification", "SR5.Item"];
}

console.log("ModificationData", ModificationData(), new Modification());
