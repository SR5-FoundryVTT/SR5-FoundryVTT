import { BaseItemData, ItemBase } from "./ItemBase";
const { NumberField, BooleanField, StringField, DocumentUUIDField } = foundry.data.fields;

const ContactData = () => ({
    ...BaseItemData(),

    type: new StringField({ required: true }),
    connection: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
    loyalty: new NumberField({ required: true,  nullable: false, integer: true, initial: 0, min: 0 }),
    family: new BooleanField(),
    blackmail: new BooleanField(),
    group: new BooleanField(),
    linkedActor: new DocumentUUIDField({ blank: true, required: true, nullable: false }),
});

export class Contact extends ItemBase<ReturnType<typeof ContactData>> {
    static override defineSchema() {
        return ContactData();
    }
    static override LOCALIZATION_PREFIXES = ["SR5.Contact", "SR5.Item"];
}

console.log("ContactData", ContactData(), new Contact());
