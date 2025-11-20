import { SR5 } from "@/module/config";
import { ActionRollData } from "./Action";
import { BaseItemData, ItemBase } from "./ItemBase";
const { SchemaField, NumberField, StringField, ArrayField } = foundry.data.fields;

const ComplexFormData = () => ({
    ...BaseItemData(),
    action: new SchemaField({
        ...ActionRollData({test: 'ComplexFormTest', opposedTest: 'OpposedTest', followedTest: 'FadeTest'}),
        categories: new ArrayField(new StringField({ required: true }), { initial: ['complex_form'] }),
    }),

    target: new StringField({
        blank: true,
        required: true,
        choices: SR5.matrixTargets, // what to do with 'host' (from chummer)?
    }),
    duration: new StringField({ required: true }),
    fade: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
});

export class ComplexForm extends ItemBase<ReturnType<typeof ComplexFormData>> {
    static override defineSchema() {
        return ComplexFormData();
    }
}

console.log("ComplexFormData", ComplexFormData(), new ComplexForm());
