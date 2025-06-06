import { SR5ActiveEffect } from "../SR5ActiveEffect";
import { SuccessTest } from "../../tests/SuccessTest";
import { SR5Actor } from "../../actor/SR5Actor";
import { OpposedTest } from "../../tests/OpposedTest";
import { SR5Item } from "../../item/SR5Item";
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
        const changes: any[] = [];

        for (const effect of this.allApplicableEffects()) {
            // Organize non-disabled effects by their application priority            
            if (!effect.active) continue;

            if (this._skipEffectForTestLimitations(effect)) continue;

            // Collect all changes of effect left.
            changes.push(...effect.changes.map(change => {
                const c = foundry.utils.deepClone(change) as any;
                // Make sure FoundryVTT key migration doesn't affect us here.
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
        // Filter effects that don't apply to this test.
        const tests = effect.selectionTests;
        // Opposed tests use the same item as the success test but normally don't apply effects from it.
        // However if an effect defines a test, it should apply to it.
        if (tests.length === 0 && this.test.opposing) return true;
        if (tests.length > 0 && !tests.includes(this.test.type)) return true;

        // Check for action categories
        // Both the effect and test can both define multiple categories.
        // One match is enough.
        const categories = effect.selectionCategories;
        const testCategories = this.test.data.categories;
        if (categories.length > 0 && !categories.find(category => testCategories.includes(category))) return true;

        // Check for test skill.
        const skills = effect.selectionSkills;
        const skillId = this.test.data.action.skill;
        const skillName = this.test.actor?.getSkill(skillId)?.name || skillId;
        if (skills.length > 0 && !skills.includes(skillName)) return true;

        // Check for test attributes used.
        const attributes = effect.selectionAttributes;
        const attribute = this.test.data.action.attribute;
        const attribute2 = this.test.data.action.attribute2;
        if (attributes.length > 0 && attribute && !attributes.includes(attribute)) return true;
        if (attributes.length > 0 && attribute2 && !attributes.includes(attribute2)) return true;
        if (attributes.length > 0 && !attribute && !attribute2) return true;

        // Check for test limits used.
        const limits = effect.selectionLimits;
        const limit = this.test.data.action.limit.attribute;
        if (limits.length > 0 && !limits.includes(limit)) return true;

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
            effectData['flags.shadowrun5e.appliedByTest'] = true;
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
            effectData.changes = effectData.changes.map(change => {
                SR5ActiveEffect.resolveDynamicChangeValue(this.test, change);
                return change;
            });

            effectsData.push(effectData);
        }

        for (const effect of allApplicableItemsEffects(this.test.item, { applyTo: ['targeted_actor'], nestedItems: false })) {
            const effectData = effect.toObject() as unknown as SR5ActiveEffect;

            // Transform all dynamic values to static values.
            effectData.changes = effectData.changes.map(change => {
                SR5ActiveEffect.resolveDynamicChangeValue(this.test, change);
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
    static async _createTargetedEffectsAsGM(actor: SR5Actor, effectsData: ActiveEffect.CreateData[]) {
        const alias = game.user?.name;
        const linkedTokens = actor.getActiveTokens(true) || [];
        const token = linkedTokens.length === 1 ? linkedTokens[0].id : undefined;

        const effects = await actor.createEmbeddedDocuments('ActiveEffect', effectsData) as SR5ActiveEffect[];

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
        await SocketMessage.emitForGM(FLAGS.CreateTargetedEffects, { actorUuid: actor.uuid, effectsData });
    }

    /**
     * Handle a sent socket message to create effects on a target actor.
     * @param {string} message.actorUuid Must contain the uuid of the actor to create the effects on.
     * @param {ActiveEffectData[]} message.effectsData Must contain a list of effects data to be applied.
     * @returns 
     */
    static async _handleCreateTargetedEffectsSocketMessage(message: Shadowrun.SocketMessageData) {
        if (!message.data.hasOwnProperty('actorUuid') && !message.data.hasOwnProperty('effectsData')) {
            console.error(`Shadowrun 5e | ${this.name} Socket Message is missing necessary properties`, message);
            return;
        }

        if (!message.data.effectsData.length) return;

        const actor = await fromUuid(message.data.actorUuid) as SR5Actor;

        return await SuccessTestEffectsFlow._createTargetedEffectsAsGM(actor, message.data.effectsData);
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

        for (const effect of this.test.item.effects as unknown as SR5ActiveEffect[]) {
            if (effect.applyTo === 'targeted_actor') yield effect;
        }
    }
}