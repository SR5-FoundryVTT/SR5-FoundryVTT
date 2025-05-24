const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;
import { ShadowrunModel as SM } from "../ShadowrunModel";
import { data } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/client-esm/client.mjs";

const SourceEntityField: DataSchema = {
    id: new StringField({ required: true }),
    name: new StringField({ required: true, initial: '' }),
    pack: new StringField({ required: false, initial: '' }),
    type: new StringField({ required: true, initial: 'Actor', choices: ['Actor', 'Item'] }),
    data: new ObjectField({ required: false, initial: {} }),
};

const HostData: DataSchema = {
    ...SM.DevicePartData,
    ...SM.DescriptionPartData,
    ...SM.ActionPartData,
    rating: new NumberField({ required: true, default: 1 }),
    //todo
    // marks: new SchemaField(SM.MatrixMarks, { required: true }),
    ic: new ArrayField(new SchemaField(SourceEntityField), { required: true }),
    customAttributes: new BooleanField({ required: true, initial: false }),
}

export class Host extends foundry.abstract.TypeDataModel<typeof HostData, Item> {
    static override defineSchema(): DataSchema {
        return HostData;
    }
}
