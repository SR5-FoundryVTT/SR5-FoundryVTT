const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;
import { DataSchema } from "node_modules/fvtt-types/src/foundry/common/data/fields.mjs";
import { ShadowrunModel as SM } from "../ShadowrunModel";

const ContactData = {
    ...SM.DescriptionPartData,
    ...SM.ImportFlags,
    type: new StringField({ required: true, initial: '' }),
    connection: new NumberField({ required: true, initial: 0 }),
    loyalty: new NumberField({ required: true, initial: 0 }),
    family: new BooleanField({ required: true, initial: false }),
    blackmail: new BooleanField({ required: true, initial: false }),
    group: new BooleanField({ required: true, initial: false }),
    linkedActor: new StringField({ required: true, initial: '' }),
}

export class Contact extends foundry.abstract.TypeDataModel<typeof ContactData, Item.Implementation> {
    static override defineSchema() {
        return ContactData;
    }
}
