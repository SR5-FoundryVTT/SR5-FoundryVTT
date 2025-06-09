import { ImportFlags } from "../template/ImportFlagsModel";
import { DescriptionPartData } from "../template/DescriptionModel";
const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;

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


export class Contact extends foundry.abstract.TypeDataModel<typeof ContactData, Item.Implementation> {
    static override defineSchema() {
        return ContactData;
    }
}
console.log("ContactData", ContactData, new Contact());

