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

        for (const effect of this.allApplicableEffects()) {
            if (this._skipEffectForTestLimitations(effect)) continue;

            // Collect all changes of effect left.
            const effectChanges = effect.system?.changes ?? [];
            changes.push(...effectChanges.map(change => {
                const c = foundry.utils.deepClone<typeof changes[number]>(change as any);
                // TODO: v15 - Foundry used to change data. references in changes to system. But tests use data. 
                c.key = c.key.replace(/^system\./, 'data.');
                c.effect = effect;
                return c;
            }));
            // TODO: What's with the statuses?
            // for (const statusId of effect.statuses) this.statuses.add(statusId);
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
     * Should this effect be skipped for this test?
     * 
     * Check all limitations of the effect against the test.
     * 
     * There is a few special cases to consider:
     * - effects limit a category (skill, attribute), but the test doesn't use that category.
     *   in that case the effect shouldn't apply.
     * - effects that don't limit the test type, shouldn't apply to opposed tests
     *   however, if a test limitation is used, it should still apply. 
     * 
     * @param effect An apply-to 'test_all' effect with possible test limitations.
     * @returns 
     */
    _skipEffectForTestLimitations(effect: SR5ActiveEffect) {
    // Changed to check also the reversed (not) filters that may have been set to rule out specific tests, categories, skills, attributes or limits - if any of those filters match the test, the effect should not be applied.
    // 1. Tests / Opposing
    const normalTests = effect.system.selection_tests.filter(test => !test.not).map(test => test.id);
    const notTests = effect.system.selection_tests.filter(test => test.not).map(test => test.id);
    if (normalTests.length === 0 && notTests.length === 0 && this.test.opposing) return true;
    if (notTests.includes(this.test.type)) return true;
    if (normalTests.length > 0 && !normalTests.includes(this.test.type)) return true;

    // 2. Categories
    const normalCategories = effect.system.selection_categories.filter(test => !test.not).map(test => test.id);
    const notCategories = effect.system.selection_categories.filter(test => test.not).map(test => test.id);
    const testCategories = this.test.data.categories;
    if (notCategories.some(cat => testCategories.includes(cat))) return true;
    if (normalCategories.length > 0 && !normalCategories.some(cat => testCategories.includes(cat))) return true;

    // 3. Skills
    const normalSkills = effect.system.selection_skills.filter(test => !test.not).map(test => test.id);
    const notSkills = effect.system.selection_skills.filter(test => test.not).map(test => test.id);
    const skillId = this.test.data.action.skill;
    const skillName = this.test.actor?.getSkill(skillId)?.name || skillId;
    if (notSkills.includes(skillId) || notSkills.includes(skillName)) return true;
    if (normalSkills.length > 0 && !normalSkills.includes(skillId) && !normalSkills.includes(skillName)) return true;

    // 4. Attributes
    const normalAttributes = effect.system.selection_attributes.filter(test => !test.not).map(test => test.id);
    const notAttributes = effect.system.selection_attributes.filter(test => test.not).map(test => test.id);
    const attribute = this.test.data.action.attribute;
    const attribute2 = this.test.data.action.attribute2;
    if (notAttributes.includes(attribute) || notAttributes.includes(attribute2)) return true;
    if (normalAttributes.length > 0) {
        if (!attribute && !attribute2) return true;
        if (!normalAttributes.includes(attribute) && !normalAttributes.includes(attribute2)) return true;
    }

    // 5. Limits
    const normalLimits = effect.system.selection_limits.filter(test => !test.not).map(test => test.id);
    const notLimits = effect.system.selection_limits.filter(test => test.not).map(test => test.id);
    const limit = this.test.data.action.limit.attribute;
    if (notLimits.includes(limit)) return true;
    if (normalLimits.length > 0 && !normalLimits.includes(limit)) return true;

    return false;
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
        const effectsData = this._collectTargetActorEffectsData();
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

    _collectTargetActorEffectsData() {
        const actor = this.test.actor;

        if (actor === undefined || this.test.item === undefined) return;

        const effectsData: SR5ActiveEffect[] = [];
        for (const effect of allApplicableDocumentEffects(this.test.item, { applyTo: ['targeted_actor'] })) {
            const effectData = effect.toObject() as unknown as SR5ActiveEffect;

            // Transform all dynamic values to static values.
            effectData.system.changes = effectData.system.changes.map(change => {
                SR5ActiveEffect.resolveDynamicChangeValue(this.test, change as unknown as ActiveEffect.ChangeData);
                return change;
            });

            effectsData.push(effectData);
        }

        for (const effect of allApplicableItemsEffects(this.test.item, { applyTo: ['targeted_actor'], nestedItems: false })) {
            const effectData = effect.toObject() as unknown as SR5ActiveEffect;

            // Transform all dynamic values to static values.
            effectData.system.changes = effectData.system.changes.map(change => {
                SR5ActiveEffect.resolveDynamicChangeValue(this.test, change as unknown as ActiveEffect.ChangeData);
                return change;
            });

            effectsData.push(effectData);
        }

        console.debug(`Shadowrun5e | To be created effects on target actor ${actor.name}`, effectsData);

        return effectsData;
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
        const content = await renderTemplate('systems/shadowrun5e/dist/templates/chat/test-effects-message.hbs', templateData);
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
    *allApplicableEffects(): Generator<SR5ActiveEffect> {
        // Pool only tests will don't have actors attached.
        if (!this.test.actor) return;

        for (const effect of allApplicableDocumentEffects(this.test.actor, { applyTo: ['test_all'] })) {
            yield effect;
        }

        for (const effect of allApplicableItemsEffects(this.test.actor, { applyTo: ['test_all'] })) {
            yield effect;
        }

        // Skip tests without an item for apply-to test_item effects.
        if (!this.test.item) return;

        for (const effect of allApplicableDocumentEffects(this.test.item, { applyTo: ['test_item'] })) {
            yield effect;
        }

        for (const effect of allApplicableItemsEffects(this.test.item, { applyTo: ['test_item'] })) {
            yield effect;
        }
    }

    /**
     * Reduce all item effects to those applicable to target actors as part of a success vs opposed test flow.
     */
    *allApplicableEffectsToTargetActor(): Generator<SR5ActiveEffect> {
        if (!this.test.item) return;

        for (const effect of this.test.item.effects) {
            if (effect.system.applyTo === 'targeted_actor') yield effect;
        }
    }
}
