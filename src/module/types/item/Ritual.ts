import { DescriptionData } from "../template/Description";
import { ImportFlagData } from "../template/ImportFlags";
import { ActionRollData } from "./Action";
const { SchemaField, StringField } = foundry.data.fields;

const RitualData = {
    action: new SchemaField(
        ActionRollData({
            test: 'RitualSpellcastingTest',
            opposedTest: 'OpposedRitualTest',
            followedTest: 'DrainTest'
        }),
    ),
    description: new SchemaField(DescriptionData()),
    importFlags: new SchemaField(ImportFlagData()),

    type: new StringField({ required: true }),
    descriptors: new StringField({ required: true }),
};

export class Ritual extends foundry.abstract.TypeDataModel<typeof RitualData, Item.Implementation> {
    static override defineSchema() {
        return RitualData;
    }
}

console.log("Ritual", RitualData, new Ritual());
