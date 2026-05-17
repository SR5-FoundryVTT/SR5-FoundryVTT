import { SR5 } from "@/module/config";
import { BaseItemData, ItemBase } from "./ItemBase";
import { TechnologyPartData } from "../template/Technology";
import { TagifyAltField } from "../fields/TagifyAltField";
const { SchemaField, NumberField, StringField, BooleanField } = foundry.data.fields;

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
    mod_armor: new SchemaField({
        value: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
        is_hardened: new BooleanField({ required: true, nullable: false, initial: false }),
        elements: new SchemaField({
            acid: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
            cold: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
            fire: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
            electricity: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
            radiation: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
            water: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
            pollutant: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
        }),
        immunities: new TagifyAltField(new StringField({ required: true })),
    }),
    slots: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
});

export class Modification extends ItemBase<ReturnType<typeof ModificationData>> {
    static override defineSchema() {
        return ModificationData();
    }
    static override LOCALIZATION_PREFIXES = ["SR5.Modification", "SR5.Item"];
}
