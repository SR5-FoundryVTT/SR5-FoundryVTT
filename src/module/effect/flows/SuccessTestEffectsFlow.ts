import { SR5ActiveEffect } from "../SR5ActiveEffect";
import { SuccessTest } from "../../tests/SuccessTest";
import { ActiveEffectData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/module.mjs";
import { SR5Actor } from "../../actor/SR5Actor";
import { OpposedTest } from "../../tests/OpposedTest";
import { SR5Item } from "../../item/SR5Item";

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

            // Filter effects that don't apply to this test.
            const tests = effect.selectionTests;
            if (tests.length > 0 && !tests.includes(this.test.type)) continue;

            const skills = effect.selectionSkills;
            const skill = this.test.data.action.skill;
            if (skills.length > 0 && !skills.includes(skill)) continue;

            const selectedAttributes = [];
            const attributes = effect.selectionAttributes;
            const attribute = this.test.data.action.attribute;
            const attribute2 = this.test.data.action.attribute2;
            if (attributes.length > 0 && attribute && !attributes.includes(attribute)) continue;
            if (attributes.length > 0 && attribute2 && !attributes.includes(attribute2)) continue;

            const limits = effect.selectionLimits;
            const limit = this.test.data.action.limit.attribute;
            if (limits.length > 0 && !limits.includes(limit)) continue;

            // Collect all changes of effect left.
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
        //@ts-expect-error Assure test is an opposed test.
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
                SR5ActiveEffect.resolveDynamicChangeValue(this.test, change);
                return change;
            });
            
            effects.push(effectData);
        }

        console.debug(`Shadowrun5e | To be created effects on target actor ${actor.name}`, effects);
        //@ts-expect-error
        return actor.createEmbeddedDocuments('ActiveEffect', effects);
    }

    /**
     * Reduce effects on test actor and item to those applicable to this test.
     *      
     * Since Foundry Core uses a generator, keep this pattern for consistency.
     * 
     */
    *allApplicable(): Generator<SR5ActiveEffect> {
        // Pool only tests will don't have actors attached.
        if (!this.test.actor) return;
        // Opposing tests do show the item, however shouldn't use effects from it.
        if (this.test.opposing) return console.error('Effects don\'t apply to opposing tests.');

        // Actor effects apply only for all tests.
        for (const effect of this.test.actor.effects as unknown as SR5ActiveEffect[]) {
            if (effect.applyTo === 'test_all') yield effect;
        }

        // apply-to 'test_all' effects for OwnedItems and NestedItems
        for (const item of this.test.actor.items as unknown as SR5Item[]) {
            for (const effect of item.effects as unknown as SR5ActiveEffect[]) {
                if (effect.skipApply(item)) continue;

                if (effect.applyTo === 'test_all') yield effect;
            }

            for (const nestedItem of item.items) {
                for (const effect of nestedItem.effects as unknown as SR5ActiveEffect[]) {
                    if (effect.skipApply(nestedItem)) continue;
    
                    if (effect.applyTo === 'test_all') yield effect;
                }
            }
        }

        // Skip tests without an item for apply-to test_item effects.
        if (!this.test.item) return;

        // Item effects can also apply to this test only.
        for (const effect of this.test.item?.effects as unknown as SR5ActiveEffect[]) {
            if (effect.skipApply(effect.parent as SR5Item)) continue;

            if (effect.applyTo === 'test_item') yield effect;            
        }
        
        // NestedItem effects can also apply to this test only.
        for (const item of this.test.item?.items as unknown as SR5Item[]) {
            // Allow users to have nested items that don't affect tests by having them unequipped.
            if (!item.isEquipped()) continue;

            for (const effect of item.effects as unknown as SR5ActiveEffect[]) {
                if (effect.skipApply(item)) continue;

                if (effect.applyTo === 'test_item') yield effect;
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
}