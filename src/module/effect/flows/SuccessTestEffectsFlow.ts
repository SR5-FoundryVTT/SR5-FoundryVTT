import { SR5ActiveEffect } from "../SR5ActiveEffect";
import { SuccessTest } from "../../tests/SuccessTest";
import { SR5Actor } from "../../actor/SR5Actor";
import { allApplicableDocumentEffects, allApplicableItemsEffects } from "../../effects";
import { SocketMessage } from "../../sockets";
import { FLAGS } from "../../constants";

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
    applyAllEffects() {
        // Extended tests have their effects applied on first run.
        // As soon as a test is extended, it's effects are already applied and shouldn't be applied again
        if (this.test.extendedRoll) return;

        // Since we're extending EffectChangeData by a effect field only locally, I don't care enough to resolve the typing issue.
        const changes: (ActiveEffect.ChangeData & { effect: SR5ActiveEffect; priority: number })[] = [];

        for (const { effect, applyTo } of this.allApplicableEffects()) {
            // Each target on the effect that matches the relevant apply-to is gated by its own
            // conditions, and contributes only the changes assigned to it.
            for (const target of effect.system.targets) {
                if (target.applyTo !== applyTo) continue;
                if (!this._evaluateTarget(target)) continue;

                const targetChanges = effect.system.changes.filter(change => change.target === target.id);
                changes.push(...targetChanges.map(change => {
                    const c = foundry.utils.deepClone<typeof changes[number]>(change as any);
                    // TODO: v15 - Foundry used to change data. references in changes to system. But tests use data.
                    c.key = c.key.replace(/^system\./, 'data.');
                    c.effect = effect;
                    return c;
                }));
            }
        }

        changes.sort((a, b) => a.priority - b.priority);

        // Apply all changes
        for (const change of changes) {
            if (!change.key) continue;
            const ActiveEffect = foundry.documents.ActiveEffect.implementation;
            ActiveEffect.applyChange(this.test as any, change);
        }
    }

    /**
     * Evaluate whether a target's conditions pass for the current test.
     * All conditions must pass (AND logic).
     *
     * Special case: a target without any explicit 'tests' condition is skipped for opposed
     * tests (preserves the original opposed-test guard behavior).
     *
     * @param target A test apply-to target with possible filter conditions.
     */
    _evaluateTarget(target: SR5ActiveEffect['system']['targets'][number]): boolean {
        const conditions = target.conditions ?? [];

        const hasTestsCondition = conditions.some(c => c.type === 'tests' && (c.values ?? []).length > 0);
        if (this.test.opposing && !hasTestsCondition) return false;

        return conditions.every(condition => this._evaluateFilterCondition(condition));
    }

    /**
     * Evaluate a single filter condition against the current test.
     * The condition's `type` picks the test dimension, `mode` flips include/exclude,
     * and `values` are the ids to match. Empty filters remain active: an empty include
     * matches nothing, while an empty exclude excludes nothing.
     */
    _evaluateFilterCondition(condition: SR5ActiveEffect['system']['targets'][number]['conditions'][number]): boolean {
        const values = condition.values ?? [];
        if (values.length === 0) return condition.mode === 'exclude';

        let matches = false;
        switch (condition.type) {
            case 'tests':
                matches = values.includes(this.test.type);
                break;

            // Any test category matching any selected category counts.
            case 'categories': {
                const testCategories = this.test.data.categories;
                matches = !!(values as Shadowrun.ActionCategories[]).find(category => testCategories.includes(category));
                break;
            }

            case 'skills': {
                const skillId = this.test.data.action.skill;
                const skillName = this.test.actor?.getSkill(skillId)?.name || skillId;
                matches = values.includes(skillId) || values.includes(skillName);
                break;
            }

            // Test has up to two attribute slots; each present slot must be in the list.
            case 'attributes': {
                const attribute = this.test.data.action.attribute;
                const attribute2 = this.test.data.action.attribute2;
                matches = !!(attribute || attribute2) &&
                    (!attribute || values.includes(attribute)) &&
                    (!attribute2 || values.includes(attribute2));
                break;
            }

            case 'limits':
                matches = values.includes(this.test.data.action.limit.attribute);
                break;
        }

        return condition.mode === 'exclude' ? !matches : matches;
    }

    /**
     * Create Effects of applyTo 'test_all' after a success test has finished.
     * 
     * This only applies for SuccessTest that aren't opposed.
     * Opposed tests have their own flow of creating effects on the target actor.
     *
     * Before creating effects onto the target actor, resolve the dynamic values from the source context
     * of the opposed test causing the effects. When created on the target actor, the values can't be resolved
     * as there is no good reference to the causing test anymore.
     * 
     * Therefore effects on the original item can have dynamic values, while the created effects are copies with
     * 
     * @param actor The actor to create the effects on.
     */
    async createTargetActorEffects(actor: SR5Actor) {
        const effectsData = this._collectTargetActorEffectsData(actor);
        if (!effectsData || effectsData.length === 0) return;

        // Inject a flag to mark the effect as applied by a test.
        // This is necessary so we can differentiate between effects created and applied.
        for (const effectData of effectsData) {
            effectData['system.appliedByTest'] = true;
        }

        if (!game.user?.isGM) {
            await this._sendCreateTargetedEffectsSocketMessage(actor, effectsData);
        } else {
            await SuccessTestEffectsFlow._createTargetedEffectsAsGM(actor, effectsData);
        }
    }

    _collectTargetActorEffectsData(targetActor: SR5Actor) {
        if (this.test.actor === undefined || this.test.item === undefined) return;

        const effectsData: SR5ActiveEffect[] = [];
        const collect = (effect: SR5ActiveEffect) => {
            const trimmed = this._trimToTargetedActorEffectData(effect, targetActor);
            if (trimmed) effectsData.push(trimmed);
        };

        for (const effect of allApplicableDocumentEffects(this.test.item, { applyTo: ['targeted_actor'] })) {
            collect(effect);
        }

        for (const effect of allApplicableItemsEffects(this.test.item, { applyTo: ['targeted_actor'], nestedItems: false })) {
            collect(effect);
        }

        console.debug(`Shadowrun5e | To be created effects on target actor ${targetActor.name}`, effectsData);

        return effectsData;
    }

    /**
     * Build a copy of an effect containing only its targeted_actor targets and the changes
     * assigned to them, resolving dynamic change values from the current test context.
     *
     * @param effect The source effect that has at least one targeted_actor target.
     * @param targetActor The actor the effect will be copied onto, whose field types drive how
     *                    resolved values are rendered.
     * @returns Trimmed effect data, or undefined when there's nothing to copy.
     */
    _trimToTargetedActorEffectData(effect: SR5ActiveEffect, targetActor: SR5Actor) {
        const targetedIds = new Set(
            effect.system.targets.filter(target => target.applyTo === 'targeted_actor').map(target => target.id)
        );
        if (targetedIds.size === 0) return undefined;

        const effectData = effect.toObject() as unknown as SR5ActiveEffect;

        effectData.system.targets = effectData.system.targets.filter(target => targetedIds.has(target.id));
        effectData.system.changes = effectData.system.changes
            .filter(change => targetedIds.has(change.target))
            .map(change => {
                SR5ActiveEffect.resolveDynamicChangeValue(this.test, change as unknown as ActiveEffect.ChangeData, targetActor);
                return change;
            });

        return effectData;
    }

    /**
     * Create a set of effects on the targeted actor, user must have permissions.
     * @param actor The actor to create the effects on.
     * @param effectsData The effects data to be applied;
     */
    static async _createTargetedEffectsAsGM(actor: SR5Actor, effectsData: SR5ActiveEffect[]) {
        const alias = game.user?.name;
        const linkedTokens = actor.getActiveTokens(true) || [];
        const token = linkedTokens.length === 1 ? linkedTokens[0].id : undefined;

        const effects = await actor.createEmbeddedDocuments('ActiveEffect', effectsData as unknown as ActiveEffect.CreateData[]) as SR5ActiveEffect[];

        const templateData = {
            effects,
            speaker: {
                actor,
                alias,
                token
            }
        };
        const content = await foundry.applications.handlebars.renderTemplate(
            'systems/shadowrun5e/dist/templates/chat/test-effects-message.hbs', templateData
        );
        const messageData = {
            content
        };
        await ChatMessage.create(messageData);

        return effects;
    }

    /**
     * Send out a socket message to a connected GM to create actor effects.
     * @param actor The actor to create the effects on.
     * @param effectsData The effects data to be applied;
     */
    async _sendCreateTargetedEffectsSocketMessage(actor: SR5Actor, effectsData: SR5ActiveEffect[]) {
        SocketMessage.emitForGM(FLAGS.CreateTargetedEffects, { actorUuid: actor.uuid, effectsData });
    }

    /**
     * Handle a sent socket message to create effects on a target actor.
     * @param {string} message.actorUuid Must contain the uuid of the actor to create the effects on.
     * @param {ActiveEffectData[]} message.effectsData Must contain a list of effects data to be applied.
     * @returns 
     */
    static async _handleCreateTargetedEffectsSocketMessage(message: Shadowrun.SocketMessageData) {
        if (!game.user?.isGM) return;

        if (!Object.hasOwn(message.data, 'actorUuid') && !Object.hasOwn(message.data, 'effectsData'))
            return console.error(`Shadowrun 5e | ${this.name} Socket Message is missing necessary properties`, message);

        if (!message.data.effectsData.length) return;

        const actor = await fromUuid(message.data.actorUuid) as SR5Actor;

        return SuccessTestEffectsFlow._createTargetedEffectsAsGM(actor, message.data.effectsData);
    }

    /**
     * Reduce effects on test actor and item to those applicable to this test.
     *      
     * Since Foundry Core uses a generator, keep this pattern for consistency.
     * 
     */
    *allApplicableEffects(): Generator<{ effect: SR5ActiveEffect, applyTo: string }> {
        // Pool only tests will don't have actors attached.
        if (!this.test.actor) return;

        for (const effect of allApplicableDocumentEffects(this.test.actor, { applyTo: ['test_all'] })) {
            yield { effect, applyTo: 'test_all' };
        }

        for (const effect of allApplicableItemsEffects(this.test.actor, { applyTo: ['test_all'] })) {
            yield { effect, applyTo: 'test_all' };
        }

        // Effects on actors targeted by this test can modify the incoming test. Resolve both
        // Actor and TokenDocument targets to actors, deduplicating linked actor/token references.
        const targetActors = new Map<string, SR5Actor>();
        for (const target of this.test.targets) {
            const actor = target instanceof SR5Actor
                ? target
                : target instanceof TokenDocument
                    ? target.actor
                    : null;
            if (!(actor instanceof SR5Actor)) continue;

            const actorKey = actor.uuid ?? actor.id;
            if (!actorKey) continue;
            targetActors.set(actorKey, actor);
        }

        for (const actor of targetActors.values()) {
            for (const effect of allApplicableDocumentEffects(actor, { applyTo: ['test_target'] })) {
                yield { effect, applyTo: 'test_target' };
            }

            for (const effect of allApplicableItemsEffects(actor, { applyTo: ['test_target'] })) {
                yield { effect, applyTo: 'test_target' };
            }
        }

        // Skip tests without an item for apply-to test_item effects.
        if (!this.test.item) return;

        for (const effect of allApplicableDocumentEffects(this.test.item, { applyTo: ['test_item'] })) {
            yield { effect, applyTo: 'test_item' };
        }

        for (const effect of allApplicableItemsEffects(this.test.item, { applyTo: ['test_item'] })) {
            yield { effect, applyTo: 'test_item' };
        }
    }

    /**
     * Reduce all item effects to those applicable to target actors as part of a success vs opposed test flow.
     */
    *allApplicableEffectsToTargetActor(): Generator<SR5ActiveEffect> {
        if (!this.test.item) return;

        for (const effect of this.test.item.effects) {
            if (effect.appliesToAnyOf(['targeted_actor'])) yield effect;
        }
    }
}
