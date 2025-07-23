import { DevicePartData } from "./Device";
import { Attributes } from "../template/Attributes";
import { BaseItemData, ItemBase } from "./ItemBase";
import { MatrixMasterData } from "../template/MatrixNetwork";
const { SchemaField, NumberField, BooleanField, ObjectField, ArrayField, StringField, TypedObjectField } = foundry.data.fields;

export const SourceEntityField = () => ({
    id: new StringField({ required: true }),
    name: new StringField({ required: true }),
    pack: new StringField({ required: true, nullable: true, initial: null }),
    type: new StringField({ required: true, initial: 'Actor', choices: ['Actor', 'Item'] }),
    data: new ObjectField({ required: false }),
});

const HostData = {
    ...BaseItemData(),
    ...DevicePartData(),

    // override
    category: new StringField({ required: true, initial: 'host', readonly: true }),

    attributes: new SchemaField(Attributes()),
    matrix: new SchemaField(MatrixMasterData()),

    rating: new NumberField({ required: true, nullable: false, integer: true, initial: 1, min: 0 }),
    marks: new TypedObjectField(new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 })),
    ic: new ArrayField(new SchemaField(SourceEntityField())),
    customAttributes: new BooleanField(),
}

export class Host extends ItemBase<typeof HostData> {
    static override defineSchema() {
        return HostData;
    }
}

console.log("HostData", HostData, new Host());
