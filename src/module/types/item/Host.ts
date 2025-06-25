import { DevicePartData } from "./Device";
import { DescriptionData } from "../template/Description";
import { ImportFlagData } from "../template/ImportFlags";
const { SchemaField, NumberField, BooleanField, ObjectField, ArrayField, StringField, TypedObjectField } = foundry.data.fields;

export const SourceEntityField = () => ({
    id: new StringField({ required: true }),
    name: new StringField({ required: true }),
    pack: new StringField({ required: true, nullable: true, initial: null }),
    type: new StringField({ required: true, initial: 'Actor', choices: ['Actor', 'Item'] }),
    data: new ObjectField({ required: false }),
});

const HostData = {
    ...DevicePartData(),
    description: new SchemaField(DescriptionData()),
    importFlags: new SchemaField(ImportFlagData()),

    rating: new NumberField({ required: true, nullable: false, integer: true, initial: 1, min: 0 }),
    marks: new TypedObjectField(new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 })),
    ic: new ArrayField(new SchemaField(SourceEntityField())),
    customAttributes: new BooleanField(),
}

export class Host extends foundry.abstract.TypeDataModel<typeof HostData, Item.Implementation> {
    static override defineSchema() {
        return HostData;
    }
}

console.log("HostData", HostData, new Host());
