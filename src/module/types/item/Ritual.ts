import { BaseItemData, ItemBase } from "./ItemBase";
import { ActionPartData } from "./Action";
const { StringField } = foundry.data.fields;

const RitualData = () => ({
    ...BaseItemData(),
    ...ActionPartData({
        type: 'complex',
        test: 'RitualSpellcastingTest',
        opposedTest: 'OpposedRitualTest',
        followedTest: 'DrainTest'
    }),

    type: new StringField({
        blank: true,
        required: true,
        choices: ['physical', 'mana']
    }),
    descriptors: new StringField({ required: true }),
});

export class Ritual extends ItemBase<ReturnType<typeof RitualData>> {
    static override defineSchema() {
        return RitualData();
    }
}

console.log("Ritual", RitualData(), new Ritual());
