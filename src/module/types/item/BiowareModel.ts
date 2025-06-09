import { ArmorPartData } from "./ArmorModel";
import { ActionPartData } from "./ActionModel";
import { ImportFlags } from "../template/ImportFlagsModel";
import { TechnologyPartData } from "../template/TechnologyModel";
import { DescriptionPartData } from "../template/DescriptionModel";
const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;

const BiowareData = {
    ...DescriptionPartData(),
    ...TechnologyPartData(),
    ...ActionPartData(),
    ...ImportFlags(),
    ...ArmorPartData(),
    essence: new NumberField({ required: true, nullable: false, initial: 0 }),
    capacity: new NumberField({ required: true, nullable: false, initial: 0 }),
    grade: new StringField({
        required: true,
        initial: 'standard',
        choices: ['alpha', 'beta', 'delta', 'gamma', 'standard'],
    }),
}


export class Bioware extends foundry.abstract.TypeDataModel<typeof BiowareData, Item.Implementation> {
    static override defineSchema() {
        return BiowareData;
    }
}

console.log("BiowareData", BiowareData, new Bioware());
