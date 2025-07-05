import { BaseItemData, ItemBase } from "./ItemBase";
const { NumberField, BooleanField, StringField } = foundry.data.fields;

const ContactData = {
    ...BaseItemData(),

    type: new StringField({ required: true }),
    connection: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
    loyalty: new NumberField({ required: true,  nullable: false, integer: true, initial: 0, min: 0 }),
    family: new BooleanField(),
    blackmail: new BooleanField(),
    group: new BooleanField(),
    linkedActor: new StringField({ required: true }),
};

export class Contact extends ItemBase<typeof ContactData> {
    static override defineSchema() {
        return ContactData;
    }
}

console.log("ContactData", ContactData, new Contact());
