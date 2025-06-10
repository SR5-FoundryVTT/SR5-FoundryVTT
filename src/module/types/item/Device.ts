import { MatrixAttributes } from "../actor/Common";
import { ImportFlags } from "../template/ImportFlags";
import { TechnologyPartData } from "../template/Technology";
import { DescriptionPartData } from "../template/Description";
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
