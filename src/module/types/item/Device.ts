import { MatrixAttributes } from "../actor/Common";
import { TechnologyData } from "../template/Technology";
import { ImportFlagData } from "../template/ImportFlags";
import { DescriptionData } from "../template/Description";
const { SchemaField, ArrayField, StringField } = foundry.data.fields;

export const DevicePartData = () => ({
    category: new StringField({
        required: true,
        initial: 'commlink',
        blank: true,
        choices: ['commlink', 'cyberdeck', 'rcc', 'host', ''],
    }),
    atts: new SchemaField(MatrixAttributes(), { required: true }),
    networkDevices: new ArrayField(new StringField({ required: true, initial: '' })),
});

const DeviceData = {
    ...DevicePartData(),
    description: new SchemaField(DescriptionData(), { required: true }),
    importFlags: new SchemaField(ImportFlagData(), { required: true }),
    technology: new SchemaField(TechnologyData(), { required: true }),
};

export class Device extends foundry.abstract.TypeDataModel<typeof DeviceData, Item.Implementation> {
    static override defineSchema() {
        return DeviceData;
    }
}

console.log("DeviceData", DeviceData, new Device());
