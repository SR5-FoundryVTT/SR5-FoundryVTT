import { SR5ActiveEffect } from "../../effect/SR5ActiveEffect";
import { SuccessTest } from "../SuccessTest";

/**
 * Handle the SR5ActiveEffects flow for a SuccessTest.
 * 
 * The flow pattern follows the composite pattern.
 */
export class SuccessTestEffectsFlow<T extends SuccessTest> {
    test: T;

    constructor(test: T) {
        this.test = test;
    }

    apply() {
        const changes = [];
        for (const effect of this.allApplicable()) {
            // Organize non-disabled effects by their application priority            
                //@ts-ignore
                if (!effect.active) continue;
                //@ts-ignore
                changes.push(...effect.changes.map(change => {
                    const c = foundry.utils.deepClone(change);
                    // TODO: Remove this crap... Clear the issue of submitting the SR5ActiveEffectConfig changing all data. to system.
                    c.key = c.key.replace('system.', 'data.');
                    c.effect = effect;
                    c.priority = c.priority ?? (c.mode * 10);
                    return c;
                }));
                //@ts-ignore
                // for (const statusId of effect.statuses) this.statuses.add(statusId);
        }

        //@ts-ignore
        changes.sort((a, b) => a.priority - b.priority);

        // Apply all changes
        for (const change of changes) {
            //@ts-ignore
            if (!change.key) continue;
            //@ts-ignore
            // const changes = change.effect.apply(this, change);
            change.effect.apply(this.test, change);
            //@ts-ignore
            // Object.assign(overrides, changes);
        }
    }

    /**
     * Collect all applicable SR5ActiveEffects for this test.
     * 
     */
    *allApplicable(): Generator<SR5ActiveEffect> {
        if (this.test.actor) {
            for (const effect of this.test.actor.effects as unknown as SR5ActiveEffect[]) {
                if (effect.applyTo === 'test_all') yield effect;                
            }
        }

        if (this.test.item) {
            for (const effect of this.test.item.effects as unknown as SR5ActiveEffect[]) {
                if (effect.applyTo === 'test_item') yield effect;
            }
        }
    }
}