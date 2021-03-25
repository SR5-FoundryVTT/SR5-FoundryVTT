import {shadowrunRulesModifiers} from "./sr5.Modifiers.spec";

export const quenchRegister = quench => {
    quench.registerBatch("shadowrun5e.rules.modifiers", shadowrunRulesModifiers);
};
