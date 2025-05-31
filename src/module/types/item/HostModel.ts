const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField, TypedObjectField } = foundry.data.fields;
import { DescriptionPartData } from "../template/DescriptionModel";
import { ActionPartData } from "./ActionModel";
import { DevicePartData } from "./DeviceModel";

const SourceEntityField = () => ({
    id: new StringField({ required: true }),
    name: new StringField({ required: true, initial: '' }),
    pack: new StringField({ required: true, initial: '' }),
    type: new StringField({ required: true, initial: 'Actor', choices: ['Actor', 'Item'] }),
    data: new ObjectField({ required: false, initial: {} }),
});

const HostData = {
    ...DevicePartData(),
    ...DescriptionPartData(),
    ...ActionPartData(),
    rating: new NumberField({ required: true, nullable: false, initial: 1 }),
    marks: new TypedObjectField(new NumberField({ required: true, nullable: false, initial: 0 }), { required: true }),
    ic: new ArrayField(new SchemaField(SourceEntityField()), { required: true }),
    customAttributes: new BooleanField({ required: true, initial: false }),
}

export class Host extends foundry.abstract.TypeDataModel<typeof HostData, Item.Implementation> {
    static override defineSchema() {
        return HostData;
    }
}

console.log("HostData", HostData, new Host());
