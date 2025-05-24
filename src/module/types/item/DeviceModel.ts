const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;
import { DataSchema } from "node_modules/fvtt-types/src/foundry/common/data/fields.mjs";
import { ShadowrunModel as SM } from "../ShadowrunModel";

export const DevicePartData = {
    category: new StringField({
        required: true,
        initial: '',
        choices: ['commlink', 'cyberdeck', 'rcc', 'host', ''],
    }),
    //todo
    //atts: new SchemaField(SM.MatrixAttributes),
    networkDevices: new ArrayField(new StringField({ required: true, initial: '' })),
};

export const DeviceAttribute = {
    value: new NumberField({ required: true, initial: 0 }),
    att: new StringField({
        required: true,
        initial: '',
        choices: ['attack', 'sleaze', 'data_processing', 'firewall'],
    }),
    editable: new BooleanField({ required: true, initial: false }),
};
    
const DeviceData = {
    ...DevicePartData,
    ...SM.DescriptionPartData,
    ...SM.TechnologyPartData,
    ...SM.ImportFlags,
};

export class Device extends foundry.abstract.TypeDataModel<typeof DeviceData, Item.Implementation> {
    static override defineSchema() {
        return DeviceData;
    }
}
