import { SR5ActiveEffect } from "../SR5ActiveEffect";
import { SuccessTestEffectsFlow } from "./SuccessTestEffectsFlow";
import type { PreparationTriggerTest } from "../../tests/PreparationTriggerTest";

/**
 * A triggered preparation rolls on its own Force and Potency, not on whoever set it off. SR5#306.
 *
 * Test effects of the triggering actor and its other items are skipped. Effects on the
 * preparation itself and incoming test effects of the targeted actors still apply.
 */
export class PreparationTriggerEffectsFlow<T extends PreparationTriggerTest> extends SuccessTestEffectsFlow<T> {
    override *allApplicableEffects(): Generator<{ effect: SR5ActiveEffect, applyTo: string }> {
        const preparationUuid = this.test.item?.uuid;

        for (const applicable of super.allApplicableEffects()) {
            const onPreparation = !!preparationUuid && applicable.effect.parent?.uuid === preparationUuid;
            if (applicable.applyTo === 'test_all' && !onPreparation) continue;
            yield applicable;
        }
    }
}
