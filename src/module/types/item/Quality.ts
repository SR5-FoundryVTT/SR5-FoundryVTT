import { ActionPartData } from "./Action";
import { BaseItemData, ItemBase } from "./ItemBase";
import { SR5 } from '@/module/config';
const { NumberField, StringField } = foundry.data.fields;

const QualityData = () => ({
    ...BaseItemData(),
    ...ActionPartData(),

    type: new StringField({
        required: true,
        initial: 'positive',
        choices: SR5.qualityTypes,
    }),
    karma: new NumberField({ required: true, nullable: false, initial: 0 }),
    rating: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
});

export class Quality extends ItemBase<ReturnType<typeof QualityData>> {
    static override defineSchema() {
        return QualityData();
    }

    static override LOCALIZATION_PREFIXES = ["SR5.Quality", "SR5.Item"];
}

console.log("QualityData", QualityData(), new Quality());
