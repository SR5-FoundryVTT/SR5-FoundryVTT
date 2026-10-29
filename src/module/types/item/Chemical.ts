import { BaseItemData, ItemBase } from "./ItemBase";
import { ActionPartData } from "./Action";
import { TechnologyPartData } from "../template/Technology";
import { ChemicalData } from "../template/Chemical";

/**
 * A toxin, drug or BTL, one dose per quantity. SR5#408 'Toxins', SR5#410 'Drugs', SR5#413 'BTLs'.
 *
 * Its effects describe what it does to whoever takes it. They don't apply to the actor carrying it,
 * only to the recipient of a dose: the user of a drug, the victim of a toxin. See allApplicableItemsEffects.
 */
const ChemicalItemData = () => ({
    ...BaseItemData(),
    // Using a dose is the root of a chain without a roll. See FlowRunner.startChain.
    ...ActionPartData(),
    ...TechnologyPartData(),
    ...ChemicalData(),
});

export class Chemical extends ItemBase<ReturnType<typeof ChemicalItemData>> {
    static override defineSchema() {
        return ChemicalItemData();
    }
}
