import { Typed } from "../typed";
import { SR5 } from "@/module/config";
import { ActionPartData } from "./Action";
import { BaseItemData, ItemBase } from "./ItemBase";
const { NumberField, StringField } = foundry.data.fields;

const QualityData = () => ({
    ...BaseItemData(),
    ...ActionPartData(),

    type: new StringField({
        required: true,
        initial: 'positive',
        choices: Typed.keys(SR5.qualityTypes)
    }),
    karma: new NumberField({ required: true, nullable: false, initial: 0 }),
    rating: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
});

export class Quality extends ItemBase<ReturnType<typeof QualityData>> {
    static override defineSchema() {
        return QualityData();
    }
}

console.log("QualityData", QualityData(), new Quality());
