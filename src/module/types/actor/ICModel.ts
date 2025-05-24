const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;
import { ShadowrunModel as SM } from "../ShadowrunModel";

const ICAttributes: DataSchema = {
    rating: new SchemaField(SM.AttributeField, { required: true }),
    attack: new SchemaField(SM.AttributeField, { required: true }),
    sleaze: new SchemaField(SM.AttributeField, { required: true }),
    data_processing: new SchemaField(SM.AttributeField, { required: true }),
    firewall: new SchemaField(SM.AttributeField, { required: true }),
}

export const ICData: DataSchema = {
    ...SM.CommonData,
    ...SM.MatrixActorData,
    ...SM.MatrixTrackActorData,
    icType: new StringField({
        required: true,
        initial: "IC",
        choices: Object.keys(SR5CONFIG.ic.types),
    }),
    host: new SchemaField({
        rating: new NumberField({ required: true, initial: 0 }),
        id: new StringField({ required: true, initial: "" }),
        atts: new SchemaField(SM.MatrixAttributes, { required: true }),
    }, { required: true }),
    attributes: new SchemaField(ICAttributes, { required: true }),
    modifiers: new SchemaField({
        //todo
        // ...SM.Modifiers,
        ...SM.CommonModifiers,
        ...SM.MatrixModifiers,
    }, { required: true }),
}

export class IC extends foundry.abstract.TypeDataModel<typeof ICData, Actor> {
    static override defineSchema(): DataSchema {
        return ICData;
    }
}
