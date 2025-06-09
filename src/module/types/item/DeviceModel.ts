import { MatrixAttributes } from "../actor/CommonModel";
import { ImportFlags } from "../template/ImportFlagsModel";
import { TechnologyPartData } from "../template/TechnologyModel";
import { DescriptionPartData } from "../template/DescriptionModel";
const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;

export const DevicePartData = () => ({
    category: new StringField({
        required: true,
        initial: '',
        blank: true,
        choices: ['commlink', 'cyberdeck', 'rcc', 'host', ''],
    }),
    atts: new SchemaField(MatrixAttributes(), { required: true }),
    networkDevices: new ArrayField(new StringField({ required: true, initial: '' })),
});

const DeviceData = {
    ...DevicePartData(),
    ...DescriptionPartData(),
    ...TechnologyPartData(),
    ...ImportFlags(),
};


export class Device extends foundry.abstract.TypeDataModel<typeof DeviceData, Item.Implementation> {
    static override defineSchema() {
        return DeviceData;
    }
}

console.log("DeviceData", DeviceData, new Device());
