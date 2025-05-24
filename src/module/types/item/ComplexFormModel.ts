const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;
import { DataSchema } from "node_modules/fvtt-types/src/foundry/common/data/fields.mjs";
import { ShadowrunModel as SM } from "../ShadowrunModel";

const ComplexFormData = {
    ...SM.DescriptionPartData,
    ...SM.ImportFlags,
    ...SM.ActionPartData,
    target: new StringField({
        required: true,
        initial: '',
        choices: ['persona', 'device', 'file', 'self', 'sprite', 'other', ''],
    }),
    duration: new StringField({ required: true, initial: '' }),
    fade: new NumberField({ required: true, initial: 0 }),
}

export class ComplexForm extends foundry.abstract.TypeDataModel<typeof ComplexFormData, Item.Implementation> {
    static override defineSchema() {
        return ComplexFormData;
    }
}
