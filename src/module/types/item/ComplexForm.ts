import { BaseItemData, ItemBase } from "./ItemBase";
import { ActionRollData } from "./Action";
const { SchemaField, NumberField, StringField } = foundry.data.fields;

const ComplexFormData = {
    ...BaseItemData(),
    action: new SchemaField(ActionRollData({test: 'ComplexFormTest', opposedTest: 'OpposedTest', followedTest: 'FadeTest'})),

    target: new StringField({
        blank: true,
        required: true,
        choices: ['persona', 'device', 'file', 'self', 'sprite', 'other', 'host'], // what to do with 'host' (from chummer)?
    }),
    duration: new StringField({ required: true }),
    fade: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
};

export class ComplexForm extends ItemBase<typeof ComplexFormData> {
    static override defineSchema() {
        return ComplexFormData;
    }
}

console.log("ComplexFormData", ComplexFormData, new ComplexForm());
