import { DescriptionPartData } from "../template/Description";
import { ImportFlags } from "../template/ImportFlags";
import { ActionPartData } from "./Action";

const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;

const RitualData = {
    ...DescriptionPartData(),
    ...ImportFlags(),
    ...ActionPartData({test: 'RitualSpellcastingTest', opposedTest: 'OpposedRitualTest', followedTest: 'DrainTest'}),
    type: new StringField({ required: true, initial: '' }),
    descriptors: new StringField({ required: true, initial: '' }),
};

export class Ritual extends foundry.abstract.TypeDataModel<typeof RitualData, Item.Implementation> {
    static override defineSchema() {
        return RitualData;
    }
}

console.log("Ritual", RitualData, new Ritual());
