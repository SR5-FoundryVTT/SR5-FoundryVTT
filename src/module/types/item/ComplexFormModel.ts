const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;
import { DescriptionPartData } from "../template/DescriptionModel";
import { ImportFlags } from "../template/ImportFlagsModel";
import { ActionPartData } from "./ActionModel";

const ComplexFormData = {
    ...DescriptionPartData,
    ...ImportFlags,
    ...ActionPartData,
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
