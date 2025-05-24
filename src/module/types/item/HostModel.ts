const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;
import { DataSchema } from "node_modules/fvtt-types/src/foundry/common/data/fields.mjs";
import { ShadowrunModel as SM } from "../ShadowrunModel";

const SourceEntityField = {
    id: new StringField({ required: true }),
    name: new StringField({ required: true, initial: '' }),
    pack: new StringField({ required: false, initial: '' }),
    type: new StringField({ required: true, initial: 'Actor', choices: ['Actor', 'Item'] }),
    data: new ObjectField({ required: false, initial: {} }),
};

const HostData = {
    ...SM.DevicePartData,
    ...SM.DescriptionPartData,
    ...SM.ActionPartData,
    rating: new NumberField({ required: true, default: 1 }),
    //todo
    // marks: new SchemaField(SM.MatrixMarks, { required: true }),
    ic: new ArrayField(new SchemaField(SourceEntityField), { required: true }),
    customAttributes: new BooleanField({ required: true, initial: false }),
}

export class Host extends foundry.abstract.TypeDataModel<typeof HostData, Item.Implementation> {
    static override defineSchema() {
        return HostData;
    }
}
