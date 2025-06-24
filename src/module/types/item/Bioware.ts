import { ArmorValueData } from "./Armor";
import { Action, ActionRollData } from "./Action";
import { TechnologyData } from "../template/Technology";
import { ImportFlagData } from "../template/ImportFlags";
import { DescriptionData } from "../template/Description";
const { SchemaField, NumberField, StringField } = foundry.data.fields;

const BiowareData = {
    action: new SchemaField(ActionRollData(), { required: true }),
    armor: new SchemaField(ArmorValueData(), { required: true }),
    description: new SchemaField(DescriptionData(), { required: true }),
    importFlags: new SchemaField(ImportFlagData(), { required: true }),
    technology: new SchemaField(TechnologyData(), { required: true }),

    essence: new NumberField({ required: true, nullable: false, initial: 0 }),
    capacity: new NumberField({ required: true, nullable: false, initial: 0 }),
    grade: new StringField({
        required: true,
        initial: 'standard',
        choices: ['alpha', 'beta', 'delta', 'gamma', 'standard', 'used'],
    }),
}

export class Bioware extends foundry.abstract.TypeDataModel<typeof BiowareData, Item.Implementation> {
    static override defineSchema() {
        return BiowareData;
    }

    static override migrateData(source) {
        if (!source || typeof source !== "object" || Object.keys(source).length === 0)
            return super.migrateData(source);

        Action.migrateData(source);

        const result = source as Bioware['_source'];
        if (!(BiowareData.grade.choices as string[]).includes(source.grade))
            result.grade = 'standard';

        return super.migrateData(source);
    }
}

console.log("BiowareData", BiowareData, new Bioware());
