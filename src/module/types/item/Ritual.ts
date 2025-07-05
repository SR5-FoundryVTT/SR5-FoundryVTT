import { BaseItemData, ItemBase } from "./ItemBase";
import { ActionRollData } from "./Action";
const { SchemaField, StringField } = foundry.data.fields;

const RitualData = {
    ...BaseItemData(),
    action: new SchemaField(
        ActionRollData({
            test: 'RitualSpellcastingTest',
            opposedTest: 'OpposedRitualTest',
            followedTest: 'DrainTest'
        }),
    ),

    type: new StringField({ required: true }),
    descriptors: new StringField({ required: true }),
};

export class Ritual extends ItemBase<typeof RitualData> {
    static override defineSchema() {
        return RitualData;
    }
}

console.log("Ritual", RitualData, new Ritual());
