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
        { required: true }
    ),
    description: new SchemaField(DescriptionData(), { required: true }),
    importFlags: new SchemaField(ImportFlagData(), { required: true }),

    type: new StringField({ required: true, initial: '' }),
    descriptors: new StringField({ required: true, initial: '' }),
};

export class Ritual extends foundry.abstract.TypeDataModel<typeof RitualData, Item.Implementation> {
    static override defineSchema() {
        return RitualData;
    }
}

console.log("Ritual", RitualData, new Ritual());
