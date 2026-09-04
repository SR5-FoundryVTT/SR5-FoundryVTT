import { ActionPartData } from "./Action";
import { BaseItemData, ItemBase } from "./ItemBase";
import { SpellPartData } from "../template/SpellPart";
const { BooleanField } = foundry.data.fields;

const SpellData = () => ({
    ...BaseItemData(),
    ...ActionPartData({followedTest: 'DrainTest'}),
    ...SpellPartData(),

    // Alchemical spells are learned separately from their sorcery counterparts and are the only
    // ones that can be turned into a preparation. See SR5#304 'Step 1: Choose a Spell'.
    alchemical: new BooleanField({ initial: false }),
});

export class Spell extends ItemBase<ReturnType<typeof SpellData>> {
    static override defineSchema() {
        return SpellData();
    }

    static override LOCALIZATION_PREFIXES = ["SR5.Spell", "SR5.Item"];
}

console.log("SpellData", SpellData(), new Spell());
