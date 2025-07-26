import { BaseItemData, ItemBase } from "./ItemBase";
import { MatrixAttributes } from "../template/Matrix";
import { AnyMutableObject } from "fvtt-types/utils";
const { SchemaField, NumberField, BooleanField, ObjectField, ArrayField, StringField, TypedObjectField, DocumentUUIDField } = foundry.data.fields;

export const SourceEntityField = () => ({
    id: new StringField({ required: true }),
    name: new StringField({ required: true }),
    pack: new StringField({ required: true, nullable: true, initial: null }),
    type: new StringField({ required: true, initial: 'Actor', choices: ['Actor', 'Item'] }),
    data: new ObjectField({ required: false }),
});

const HostData = {
    ...BaseItemData(),

    rating: new NumberField({ required: true, nullable: false, integer: true, initial: 1, min: 0 }),
    marks: new TypedObjectField(new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 })),
    ic: new ArrayField(new SchemaField(SourceEntityField())),
    customAttributes: new BooleanField(),

    category: new StringField({ required: true, initial: 'host', readonly: true }),
    atts: new SchemaField(MatrixAttributes(true)),
    networkDevices: new ArrayField(new DocumentUUIDField({ blank: true, required: true, nullable: false })),
}

export class Host extends ItemBase<typeof HostData> {
    static override defineSchema() {
        return HostData;
    }
}

console.log("HostData", HostData, new Host());
