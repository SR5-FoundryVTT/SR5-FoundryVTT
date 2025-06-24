import { ArmorValueData } from "./Armor";
import { Action, ActionRollData } from "./Action";
import { ImportFlagData } from "../template/ImportFlags";
import { TechnologyData } from "../template/Technology";
import { DescriptionData } from "../template/Description";
const { SchemaField, NumberField, StringField } = foundry.data.fields;

const CyberwareData = {
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

export class Cyberware extends foundry.abstract.TypeDataModel<typeof CyberwareData, Item.Implementation> {
    static override defineSchema() {
        return CyberwareData;
    }

    static override migrateData(source) {
        if (!source || typeof source !== "object" || Object.keys(source).length === 0)
            return super.migrateData(source);

        Action.migrateData(source);

        const result = source as Cyberware['_source'];

        // Reset broken legacy data.
        if (!(CyberwareData.grade.choices as string[]).includes(source.grade))
            result.grade = 'standard';

        if (isNaN(source.essence)) {
            result.essence = 0; // Default essence value if not set
        }

        return super.migrateData(source);
    }
}

console.log("CyberwareData", CyberwareData, new Cyberware());
