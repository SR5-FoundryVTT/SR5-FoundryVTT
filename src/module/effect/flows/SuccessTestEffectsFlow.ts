import { SR5ActiveEffect } from "../SR5ActiveEffect";
import { SuccessTest } from "../../tests/SuccessTest";
import { ActiveEffectData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/module.mjs";
import { SR5Actor } from "../../actor/SR5Actor";
import { OpposedTest } from "../../tests/OpposedTest";

/**
 * Handle the SR5ActiveEffects flow for a SuccessTest.
 * 
 * The flow pattern follows the composite pattern.
 */
export class SuccessTestEffectsFlow<T extends SuccessTest> {
    // The test this flow is applied to.
    test: T;

    /**
     * Create a test flow for a given test.
     * 
     * @param test This flow will be applied to this test given. It's up to the test to call the apply method.
     */
    constructor(test: T) {
        this.test = test;
    }

    /**
     * Duplicate Foundry apply logic, but with custom handling for SR5ActiveEffects within a SuccessTest context.
     * 
     * NOTE: Since effects are applied as none unique modifiers, applying them multiple times is possible.
     *       Changes can't be applied as unique modifiers as they're names are not unique.
     */
    apply() {
        // Since we're extending EffectChangeData by a effect field only locally, I don't care enough to resolve the typing issue.
        const changes: any[] = [];

        for (const effect of this.allApplicable()) {
            // Organize non-disabled effects by their application priority            
            if (!effect.active) continue;
            changes.push(...effect.changes.map(change => {
                const c = foundry.utils.deepClone(change) as any;
                // TODO: Remove this crap... Clear the issue of submitting the SR5ActiveEffectConfig changing all data. to system.
                c.key = c.key.replace('system.', 'data.');
                c.effect = effect;
                c.priority = c.priority ?? (c.mode * 10);
                return c;
            }));
            // TODO: What's with the statuses?
            // for (const statusId of effect.statuses) this.statuses.add(statusId);
        }

        changes.sort((a, b) => a.priority - b.priority);

        // Apply all changes
        for (const change of changes) {
            if (!change.key) continue;
            change.effect.apply(this.test, change);
        }
    }

    /**
     * Create Effects of applyTo 'targeted_actor' after an opposed test has finished.
     * 
     * Before creating effects onto the target actor, resolve the dynamic values from the source context
     * of the opposed test causing the effects. When created on the target actor, the values can't be resolved
     * as there is no good reference to the causing test anymore.
     * 
     * Therefore effects on the original item can have dynamic values, while the created effects are copies with
     * static values.
     */
    async createTargetActorEffectsAfterOpposedTest() {
        //@ts-ignore Assure test is an opposed test.
        const against = this.test.against;
        const actor = this.test.actor;

        if (!against && !this.test.opposing) return;
        if (!actor) return;

        console.debug('Shadowrun5e | Creating effects on target actor after opposed test.', this.test);

        const effects: ActiveEffectData[] = [];
        for (const effect of this.allApplicableToTargetActor()) {
            const effectData = effect.toObject() as ActiveEffectData;

            // Transform all dynamic values to static values.
            effectData.changes = effectData.changes.map(change => {
                // TODO: Would a value of @hits.value be better than @test.hits.value?
                SR5ActiveEffect.resolveDynamicChangeValue({test: this.test}, change);
                return change;
            });
            
            // TODO: Check if id should be deleted or if it's recreated by creating a new effect.
            
            effects.push(effectData);
        }

        console.debug(`Shadowrun5e | To be created effects on target actor ${actor.name}`, effects);
        //@ts-ignore
        return actor.createEmbeddedDocuments('ActiveEffect', effects);
    }

    /**
     * Reduce all actor effects to those applicable to SuccessTests.
     * 
     * These can either be for ALL tests, or for those only trigger by the effects origin / source item.
     * 
     * Since Foundry Core uses a generator, keep this pattern for consistency.
     * 
     */
    *allApplicable(): Generator<SR5ActiveEffect> {
        if (this.test.actor) {
            for (const effect of this.test.actor.effects as unknown as SR5ActiveEffect[]) {
                if (effect.applyTo === 'test_all') yield effect;
                if (effect.applyTo === 'test_item' && this._effectOriginatesFromTestItem(effect)) yield effect;
            }
        }
    }

    /**
     * Reduce all item effects to those applicable to target actors as part of a success vs opposed test flow.
     */
    *allApplicableToTargetActor(): Generator<SR5ActiveEffect> {
        if (!this.test.item) return;

        for (const effect of this.test.item.effects as unknown as SR5ActiveEffect[]) {
            if (effect.applyTo === 'targeted_actor') yield effect;
        }
    }

    /**
     * Does the effect originate from item used within the SuccessTest?
     * 
     * @param effect Any SR5ActiveEffect
     * @returns true, if the effect originates from the test item.
     */
    _effectOriginatesFromTestItem(effect: SR5ActiveEffect): boolean {
        return this.test.item?.uuid == effect.origin;
    }
}