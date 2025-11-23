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
        choices: SR5.matrixTargets,
    }),
    duration: new StringField({ required: true, blank: true, choices: SR5.complexForm.durations }),
    fade: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
});

export class ComplexForm extends ItemBase<ReturnType<typeof ComplexFormData>> {
    static override defineSchema() {
        return ComplexFormData();
    }

    static override LOCALIZATION_PREFIXES = ["SR5.ComplexForm", "SR5.Item"];
}

console.log("ComplexFormData", ComplexFormData(), new ComplexForm());
