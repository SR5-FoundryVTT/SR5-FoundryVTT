const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;
import { DescriptionPartData } from "../template/DescriptionModel";
import { ImportFlags } from "../template/ImportFlagsModel";
import { TechnologyPartData } from "../template/TechnologyModel";

export const DevicePartData = () => ({
    category: new StringField({
        required: true,
        initial: '',
        choices: ['commlink', 'cyberdeck', 'rcc', 'host', ''],
    }),
    //todo
    //atts: new SchemaField(MatrixAttributes),
    networkDevices: new ArrayField(new StringField({ required: true, initial: '' })),
});

export const DeviceAttribute = () => ({
    value: new NumberField({ required: true, initial: 0 }),
    att: new StringField({
        required: true,
        initial: '',
        choices: ['attack', 'sleaze', 'data_processing', 'firewall'],
    }),
    editable: new BooleanField({ required: true, initial: false }),
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
