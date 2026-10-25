import { ModifiableValue } from "@/module/mods/ModifiableValue";
import type { SuccessTest } from "../SuccessTest";
import { TestFeatures } from "./TestFeature";

/**
 * Features the flow adds to tests it starts for a single use.
 */
export const registerFlowFeatures = () => {
    /**
     * An attack only meant to make contact, like delivering a touch spell or a contact poison: +2 dice.
     * SR5#187 'Touch-Only Attack'. The attacker winning ties is up to the step releasing on ties.
     */
    TestFeatures.touchOnly = {
        id: 'touchOnly',
        prepareValues(test) {
            ModifiableValue.addUnique(test.data.pool, 'SR5.Flow.TouchOnly', 2);
        },
    };

    /**
     * No Edge can be spent on the test, like on a preparation's spellcasting. SR5#306.
     */
    TestFeatures.noEdge = {
        id: 'noEdge',
        edge: { secondChance: false, pushTheLimit: false },
    };

    /**
     * The defender doesn't defend, by choice or because they can't. The attack is treated as a
     * success test: any hit is a hit, with all its hits as net hits. SR5#190 'Defender Unaware of Attack'.
     *
     * The defense rolls no dice. It's a hit when the attack scored any hits, otherwise a miss.
     */
    TestFeatures.noDefense = {
        id: 'noDefense',
        // Applied when consuming, after all dialog choices and pool modifiers are final.
        consume(test) {
            test.data.pool.base = 0;
            test.data.pool.changes = [];
            ModifiableValue.calcTotal(test.data.pool, { min: 0 });
            test.data.title = game.i18n.localize('SR5.Flow.NoDefense');
            return Promise.resolve(true);
        },
        outcome(test) {
            const against = (test as SuccessTest & { against?: SuccessTest }).against;
            const hit = (against?.hits.value ?? 0) > 0;
            return { success: !hit, canSucceed: true, canFail: true };
        },
        edge: { secondChance: false, pushTheLimit: false },
    };
};
