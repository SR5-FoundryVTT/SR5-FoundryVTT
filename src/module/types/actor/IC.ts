import { AttributeField, Attributes } from "../template/Attributes";
import { CommonData, MatrixActorData, MatrixTrackActorData, MatrixAttributes, CommonModifiers, MatrixModifiers } from "./Common";
const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;

const ICAttributes = () => ({
    ...Attributes(),
    rating: new SchemaField(AttributeField()),
    attack: new SchemaField(AttributeField()),
    sleaze: new SchemaField(AttributeField()),
    data_processing: new SchemaField(AttributeField()),
    firewall: new SchemaField(AttributeField()),
});

const ICData = {
    ...CommonData(),
    ...MatrixActorData(),
    ...MatrixTrackActorData(),
    icType: new StringField({ required: true }),
    host: new SchemaField({
        rating: new NumberField({ required: true, nullable: false, initial: 0 }),
        id: new StringField({ required: true }),
        atts: new SchemaField(MatrixAttributes()),
    }, { required: true }),
    attributes: new SchemaField(ICAttributes()),
    modifiers: new SchemaField({
        ...CommonModifiers(),
        ...MatrixModifiers(),
    }, { required: true }),
}


export class IC extends foundry.abstract.TypeDataModel<typeof ICData, Actor.Implementation> {
    static override defineSchema() {
        return ICData;
    }
}

console.log("ICData", ICData, new IC());
