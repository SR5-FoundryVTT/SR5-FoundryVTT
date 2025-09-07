import { DevicePartData } from "./Device";
import { BaseItemData, ItemBase } from "./ItemBase";
import { MatrixMarksTarget } from "../template/Matrix";
import { MatrixMasterData } from "../template/MatrixNetwork";
import { TechnologyAttributes } from "../template/Attributes";
const { SchemaField, NumberField, BooleanField, ObjectField, ArrayField, StringField } = foundry.data.fields;

export const SourceEntityField = () => ({
    id: new StringField({ required: true }),
    name: new StringField({ required: true }),
    pack: new StringField({ required: true, nullable: true, initial: null }),
    type: new StringField({ required: true, initial: 'Actor', choices: ['Actor', 'Item'] }),
    data: new ObjectField({ required: false }),
});

const HostData = () => ({
    ...BaseItemData(),
    ...DevicePartData(),

    // override
    category: new StringField({ required: true, initial: 'host', readonly: true }),

    attributes: new SchemaField(TechnologyAttributes()),
    matrix: new SchemaField(MatrixMasterData()),

    rating: new NumberField({ required: true, nullable: false, integer: true, initial: 1, min: 0 }),
    marks: MatrixMarksTarget(),
    ic: new ArrayField(new StringField({ required: true, nullable: false })),
    customAttributes: new BooleanField(),
});

export class Host extends ItemBase<ReturnType<typeof HostData>> {
    static override defineSchema() {
        return HostData();
    }
}

console.log("HostData", HostData(), new Host());
