import { SR5 } from "@/module/config";
import { BaseItemData, ItemBase } from "./ItemBase";
import { MatrixAttributes } from "../template/Matrix";
import { TechnologyPartData } from "../template/Technology";
const { SchemaField, ArrayField, StringField, DocumentUUIDField, NumberField } = foundry.data.fields;

/** 
 * Item has been created by an automated process during system use.
 * For example the Create Opposed Matrix Device dialog.
 * Most fields aren't used yet, just general information that might be useful at one point.
 */
export const ManagedDeviceData = () => ({
    onScene: new DocumentUUIDField({ required: true, blank: true }),
    byUser: new DocumentUUIDField({ required: true, blank: true }),
    createdAt: new StringField({ required: true, blank: false, initial: '' }),
});

export const DevicePartData = () => ({
    category: new StringField({
        required: true,
        initial: 'commlink',
        choices: SR5.deviceCategories,
    }),
    managed: new SchemaField(ManagedDeviceData(), { nullable: true, initial: null }),
    atts: new SchemaField(MatrixAttributes(true)),
    slaves: new ArrayField(new DocumentUUIDField({ blank: true, required: true, nullable: false })),
});

export const DeviceData = () => ({
    ...BaseItemData(),
    ...DevicePartData(),
    ...TechnologyPartData(),

    programs: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
});

export class Device extends ItemBase<ReturnType<typeof DeviceData>> {
    static override defineSchema() {
        return DeviceData();
    }

    static override LOCALIZATION_PREFIXES = ["SR5.Device", "SR5.Item"];
}

console.log("DeviceData", DeviceData(), new Device());
