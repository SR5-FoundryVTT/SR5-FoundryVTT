const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;
import { CommonData, MatrixActorData, MatrixTrackActorData, MatrixAttributes, CommonModifiers, MatrixModifiers } from "./CommonModel";
import { AttributeField } from "../template/AttributesModel";

const ICAttributes = () => ({
    rating: new SchemaField(AttributeField(), { required: true }),
    attack: new SchemaField(AttributeField(), { required: true }),
    sleaze: new SchemaField(AttributeField(), { required: true }),
    data_processing: new SchemaField(AttributeField(), { required: true }),
    firewall: new SchemaField(AttributeField(), { required: true }),
});

const ICData = {
    ...CommonData(),
    ...MatrixActorData(),
    ...MatrixTrackActorData(),
    icType: new StringField({
        required: true,
        initial: "",
    }),
    host: new SchemaField({
        rating: new NumberField({ required: true, initial: 0 }),
        id: new StringField({ required: true, initial: "" }),
        atts: new SchemaField(MatrixAttributes(), { required: true }),
    }, { required: true }),
    attributes: new SchemaField(ICAttributes(), { required: true }),
    modifiers: new SchemaField({
        //todo
        // ...Modifiers,
        ...CommonModifiers(),
        ...MatrixModifiers(),
    }, { required: true }),
}

console.log("ICData", ICData);

export class IC extends foundry.abstract.TypeDataModel<typeof ICData, Actor.Implementation> {
    static override defineSchema() {
        return ICData;
    }
}
