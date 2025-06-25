import { TechnologyData } from "../template/Technology";
import { ImportFlagData } from "../template/ImportFlags";
import { DescriptionData } from "../template/Description";
import { MatrixAttributes } from "../template/Matrix";
const { SchemaField, ArrayField, StringField } = foundry.data.fields;

export const DevicePartData = () => ({
    category: new StringField({
        blank: true,
        required: true,
        initial: 'commlink',
        choices: ['commlink', 'cyberdeck', 'rcc', 'host', ''],
    }),
    atts: new SchemaField(MatrixAttributes()),
    networkDevices: new ArrayField(new StringField({ required: true })),
});

const DeviceData = {
    ...DevicePartData(),
    description: new SchemaField(DescriptionData()),
    importFlags: new SchemaField(ImportFlagData()),
    technology: new SchemaField(TechnologyData()),
};

export class Device extends foundry.abstract.TypeDataModel<typeof DeviceData, Item.Implementation> {
    static override defineSchema() {
        return DeviceData;
    }
}

console.log("DeviceData", DeviceData, new Device());
