import {shadowrunRulesModifiers} from "./sr5.Modifiers.spec";
import {shadowrunSR5Item} from "./sr5.SR5Item.spec";

export const quenchRegister = quench => {
    quench.registerBatch("shadowrun5e.rules.modifiers", shadowrunRulesModifiers);
    quench.registerBatch("shadowrun5e.entities.items", shadowrunSR5Item);
};
