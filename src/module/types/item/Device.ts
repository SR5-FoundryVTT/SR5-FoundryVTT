import { BaseItemData, ItemBase } from "./ItemBase";
import { MatrixAttributes } from "../template/Matrix";
import { TechnologyData } from "../template/Technology";
const { SchemaField, ArrayField, StringField } = foundry.data.fields;

const DeviceData = {
    ...BaseItemData(),
    technology: new SchemaField(TechnologyData()),

    category: new StringField({
        required: true,
        initial: 'commlink',
        choices: ['commlink', 'cyberdeck', 'rcc'],
    }),
    atts: new SchemaField(MatrixAttributes(true)),
    networkDevices: new ArrayField(new StringField({ required: true })),
};

export class Device extends ItemBase<typeof DeviceData> {
    static override defineSchema() {
        return DeviceData;
    }
}

console.log("DeviceData", DeviceData, new Device());
