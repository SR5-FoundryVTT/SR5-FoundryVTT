import { ItemBase } from "./BaseItem";
import { ActionRollData } from "./Action";
import { ImportFlagData } from "../template/ImportFlags";
import { DescriptionData } from "../template/Description";
const { SchemaField, NumberField, StringField } = foundry.data.fields;

const ComplexFormData = () => ({
    action: new SchemaField(ActionRollData({test: 'ComplexFormTest', opposedTest: 'OpposedTest', followedTest: 'FadeTest'})),
    description: new SchemaField(DescriptionData()),
    importFlags: new SchemaField(ImportFlagData()),

    target: new StringField({
        blank: true,
        required: true,
        choices: ['persona', 'device', 'file', 'self', 'sprite', 'other', 'host', ''], // what to do with 'host' (from chummer)?
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
