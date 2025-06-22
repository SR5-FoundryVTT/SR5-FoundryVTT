import { ArmorPartData } from "./Armor";
import { Action, ActionPartData } from "./Action";
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
        choices: ['alpha', 'beta', 'delta', 'gamma', 'standard', 'used'],
    }),
}


export class Cyberware extends foundry.abstract.TypeDataModel<typeof CyberwareData, Item.Implementation> {
    static override defineSchema() {
        return CyberwareData;
    }

    static override migrateData(source) {
        if (!source || typeof source !== "object" || Object.keys(source).length === 0)
            return super.migrateData(source);

        Action.migrateData(source);

        const result = source as Cyberware['_source'];
        if (!(CyberwareData.grade.choices as string[]).includes(source.grade))
            result.grade = 'standard';

        return super.migrateData(source);
    }
}

console.log("CyberwareData", CyberwareData, new Cyberware());
