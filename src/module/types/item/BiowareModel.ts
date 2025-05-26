const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;
import { DescriptionPartData } from "../template/DescriptionModel";
import { ImportFlags } from "../template/ImportFlagsModel";
import { TechnologyPartData } from "../template/TechnologyModel";
import { ActionPartData } from "./ActionModel";
import { ArmorPartData } from "./ArmorModel";

const BiowareData = {
    ...DescriptionPartData(),
    ...TechnologyPartData(),
    ...ActionPartData(),
    ...ImportFlags(),
    ...ArmorPartData(),
    essence: new NumberField({ required: true, initial: 0 }),
    capacity: new NumberField({ required: true, initial: 0 }),
    grade: new StringField({
        required: true,
        initial: '',
        choices: ['alpha', 'beta', 'delta', 'gamma', ''],
    }),
}

export class Bioware extends foundry.abstract.TypeDataModel<typeof BiowareData, Item.Implementation> {
    static override defineSchema() {
        return BiowareData;
    }
}
