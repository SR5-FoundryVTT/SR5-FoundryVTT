import {shadowrunRulesModifiers} from "./sr5.Modifiers.spec";

export const quenchRegister = quench => {
    console.error('register');
    quench.registerBatch("shadowrun5e.rules.modifiers", shadowrunRulesModifiers);
};
