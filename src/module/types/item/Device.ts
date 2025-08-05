import { BaseItemData, ItemBase } from "./ItemBase";
import { MatrixAttributes } from "../template/Matrix";
import { TechnologyPartData } from "../template/Technology";
const { SchemaField, ArrayField, StringField, DocumentUUIDField, NumberField } = foundry.data.fields;

export const DevicePartData = () => ({
    category: new StringField({
        required: true,
        initial: 'commlink',
        choices: ['commlink', 'cyberdeck', 'rcc'],
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
}

console.log("DeviceData", DeviceData(), new Device());
