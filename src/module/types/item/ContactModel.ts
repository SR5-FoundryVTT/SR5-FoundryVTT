import { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/fields.mjs";
import { ShadowrunModel as SM } from "../ShadowrunModel";

const ContactData: DataSchema = {
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

export class Contact extends foundry.abstract.TypeDataModel<typeof ContactData, Item> {
    static override defineSchema(): DataSchema {
        return ContactData;
    }
}
