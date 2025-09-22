import { BaseItemData, ItemBase } from "./ItemBase";
import { MatrixAttributes } from "../template/Matrix";
import { TechnologyPartData } from "../template/Technology";
import { SR5 } from '@/module/config';
const { SchemaField, ArrayField, StringField, DocumentUUIDField, NumberField } = foundry.data.fields;

export const DevicePartData = () => ({
    category: new StringField({
        required: true,
        initial: 'commlink',
        choices: SR5.deviceCategories,
    }),
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
