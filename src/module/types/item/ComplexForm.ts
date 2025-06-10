import { ActionPartData } from "./Action";
import { ImportFlags } from "../template/ImportFlags";
import { DescriptionPartData } from "../template/Description";
const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;

export const ComplexFormData = () => ({
    ...DescriptionPartData(),
    ...ImportFlags(),
    ...ActionPartData(),
    target: new StringField({
        required: true,
        initial: '',
        blank: true,
        choices: ['persona', 'device', 'file', 'self', 'sprite', 'other', ''],
    }),
    duration: new StringField({ required: true, initial: '' }),
    fade: new NumberField({ required: true, nullable: false, initial: 0 }),
});


export class ComplexForm extends foundry.abstract.TypeDataModel<ReturnType<typeof ComplexFormData>, Item.Implementation> {
    static override defineSchema() {
        return ComplexFormData();
    }
}

console.log("ComplexFormData", ComplexFormData(), new ComplexForm());
