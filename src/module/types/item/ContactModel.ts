const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;
import { DescriptionPartData } from "../template/DescriptionModel";
import { ImportFlags } from "../template/ImportFlagsModel";

const ContactData = {
    ...DescriptionPartData(),
    ...ImportFlags(),
    type: new StringField({ required: true, initial: '' }),
    connection: new NumberField({ required: true, initial: 0 }),
    loyalty: new NumberField({ required: true, initial: 0 }),
    family: new BooleanField({ required: true, initial: false }),
    blackmail: new BooleanField({ required: true, initial: false }),
    group: new BooleanField({ required: true, initial: false }),
    linkedActor: new StringField({ required: true, initial: '' }),
}

console.log("ContactData", ContactData);

export class Contact extends foundry.abstract.TypeDataModel<typeof ContactData, Item.Implementation> {
    static override defineSchema() {
        return ContactData;
    }
}
