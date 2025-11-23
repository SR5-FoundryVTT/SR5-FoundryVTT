import { BaseItemData, ItemBase } from "./ItemBase";
import { ActionPartData } from "./Action";
import { SR5 } from '@/module/config';
const { StringField } = foundry.data.fields;

const RitualData = () => ({
    ...BaseItemData(),
    ...ActionPartData({
        type: 'complex',
        test: 'RitualSpellcastingTest',
        opposedTest: 'OpposedRitualTest',
        followedTest: 'DrainTest'
    }),

    type: new StringField({ required: true, blank: true, choices: SR5.spellTypes }),
    descriptors: new StringField({ required: true }),
});

export class Ritual extends ItemBase<ReturnType<typeof RitualData>> {
    static override defineSchema() {
        return RitualData();
    }

    static override LOCALIZATION_PREFIXES = ["SR5.Ritual", "SR5.Item"];
}

console.log("Ritual", RitualData(), new Ritual());
