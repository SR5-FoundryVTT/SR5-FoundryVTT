const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;
import { DescriptionPartData } from "../template/DescriptionModel";
import { ActionPartData } from "./ActionModel";
import { DevicePartData } from "./DeviceModel";

const SourceEntityField = () => ({
    id: new StringField({ required: true }),
    name: new StringField({ required: true, initial: '' }),
    pack: new StringField({ required: false, initial: '' }),
    type: new StringField({ required: true, initial: 'Actor', choices: ['Actor', 'Item'] }),
    data: new ObjectField({ required: false, initial: {} }),
});

const HostData = {
    ...DevicePartData(),
    ...DescriptionPartData(),
    ...ActionPartData(),
    rating: new NumberField({ required: true, nullable: false, default: 1 }),
    //todo
    // marks: new SchemaField(MatrixMarks, { required: true }),
    ic: new ArrayField(new SchemaField(SourceEntityField()), { required: true }),
    customAttributes: new BooleanField({ required: true, initial: false }),
}

console.log("HostData", HostData);

export class Host extends foundry.abstract.TypeDataModel<typeof HostData, Item.Implementation> {
    static override defineSchema() {
        return HostData;
    }
}
