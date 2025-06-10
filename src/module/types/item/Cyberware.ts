import { ArmorPartData } from "./Armor";
import { ActionPartData } from "./Action";
import { ImportFlags } from "../template/ImportFlags";
import { TechnologyPartData } from "../template/Technology";
import { DescriptionPartData } from "../template/Description";
const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;

const CyberwareData = {
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


export class Cyberware extends foundry.abstract.TypeDataModel<typeof CyberwareData, Item.Implementation> {
    static override defineSchema() {
        return CyberwareData;
    }
}

console.log("CyberwareData", CyberwareData, new Cyberware());
