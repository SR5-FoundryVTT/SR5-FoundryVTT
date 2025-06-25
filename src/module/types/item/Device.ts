import { TechnologyData } from "../template/Technology";
import { ImportFlagData } from "../template/ImportFlags";
import { DescriptionData } from "../template/Description";
import { MatrixAttributes } from "../template/Matrix";
const { SchemaField, ArrayField, StringField } = foundry.data.fields;

const DeviceData = {
    description: new SchemaField(DescriptionData()),
    importFlags: new SchemaField(ImportFlagData()),
    technology: new SchemaField(TechnologyData()),

    category: new StringField({
        required: true,
        initial: 'commlink',
        choices: ['commlink', 'cyberdeck', 'rcc'],
    }),
    atts: new SchemaField(MatrixAttributes(true)),
    networkDevices: new ArrayField(new StringField({ required: true })),
};

export class Device extends foundry.abstract.TypeDataModel<typeof DeviceData, Item.Implementation> {
    static override defineSchema() {
        return DeviceData;
    }
}

console.log("DeviceData", DeviceData, new Device());
