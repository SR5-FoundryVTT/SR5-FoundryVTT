import { RollDataOptions } from "../../item/Types";
import { SR5Actor } from "../SR5Actor";
import { RiggingRules } from '@/module/rules/RiggingRules';
import { FLAGS, SYSTEM_NAME } from '@/module/constants';

/**
 * Linked actors have no token of their own to read projection state from, so finding out whether
 * they project means scanning every token of every scene. getRollData runs on each data preparation,
 * so that scan is cached and only dropped when a token's system flags or the scene list change.
 */
let projectedLinkedActorIds: Set<string> | null = null;

/**
 * Tests that resolve for the physical body instead of the astral form, and therefore keep their
 * physical attributes while their character is projecting. SR5#313: the body is left behind in a
 * coma-like state, but it is still a physical body, and physical damage can only ever reach it.
 */
const PHYSICAL_BODY_TESTS = ['PhysicalResistTest', 'NaturalRecoveryPhysicalTest', 'NaturalRecoveryStunTest'];

/**
 * Handling around actor roll data resolution.
 * 
 * Functionality here 
 */
export const ActorRollDataFlow = {
    registerHooks() {
        const invalidate = () => { projectedLinkedActorIds = null; };
        Hooks.on('createToken', invalidate);
        Hooks.on('deleteToken', invalidate);
        Hooks.on('createScene', invalidate);
        Hooks.on('deleteScene', invalidate);
        Hooks.on('ready', invalidate);
        Hooks.on('updateToken', (_token, changed: Record<string, any>) => {
            if (changed?.flags?.[SYSTEM_NAME] || 'actorId' in changed || 'actorLink' in changed) invalidate();
        });
    },

    /**
     * Use the given roll data to inject values for a roll of the given actor.
     * 
     * This can result in roll data with mixed values from different actors / items.
     * 
     * @param actor
     * @param rollData
     * @param options
     */
    getRollData: function(actor: SR5Actor, rollData: any, options: RollDataOptions) {
        if (actor.isType('vehicle')) ActorRollDataFlow.injectVehicleDriverRollData(actor, rollData, options);
        if (actor.isType('character')
            && ActorRollDataFlow.isAstrallyProjecting(actor)
            && !ActorRollDataFlow.isPhysicalBodyTest(options)) {
            rollData = {
                ...rollData,
                attributes: Object.fromEntries(Object.entries(rollData.attributes ?? {})
                    .map(([id, attribute]) => [id, foundry.utils.deepClone(attribute)])),
            };
            ActorRollDataFlow.injectAstralRollData(actor, rollData, options);
        }
        return rollData;
    },

    /**
     * Inject Driver's Attributes into the RollData if the vehicle is controlled by a driver
     */
    injectVehicleDriverRollData: function(actor: SR5Actor, rollData: SR5Actor['system'], options: RollDataOptions = {}) {
        const driver = actor.getVehicleDriver()
        if (!driver) return;

        // if the driver is in control of the vehicle, inject the driver's attributes and skills
        if (actor.isControlledByDriver()) {
            RiggingRules.modifyRollDataForDriver(driver, rollData);
        }
    },

    /**
     * Determine if a test resolves for the physical body of a projecting character.
     *
     * Body and astral form share a single actor, so the test being rolled is the only signal for
     * which of the two is acting. SR5#315 limits the mental for physical attribute swap to what the
     * astral form does, while soaking damage and healing always happen to the body.
     */
    isPhysicalBodyTest: function(options: RollDataOptions) {
        const test = options.testData?.action?.test ?? options.action?.test;
        return !!test && PHYSICAL_BODY_TESTS.includes(test);
    },

    /**
     * Inject values for an actor on the astral plane.
     * 
     * TODO: Hand over to a MagicRules implementation.
     * 
     * @param actor 
     * @param rollData 
     * @param options 
     */
    injectAstralRollData: function(_actor: SR5Actor, rollData: any, _options: RollDataOptions) {
        const attributes = rollData.attributes;
        if (!attributes) return;
        const astralAttributes = {
            agility: attributes.logic,
            reaction: attributes.intuition,
            strength: attributes.charisma,
            body: attributes.willpower,
        };
        for (const [physical, mental] of Object.entries(astralAttributes)) {
            if (mental) attributes[physical] = foundry.utils.deepClone(mental);
        }
    },

    isAstrallyProjecting(actor: SR5Actor) {
        // ActorDelta construction calls getRollData while an unlinked token's synthetic actor is
        // still being materialized. Reading token.actor here can recursively materialize that same
        // delta (or its projected form's delta), so projection membership must use token metadata.
        if (actor.isToken) {
            const state = actor.token?.getFlag(SYSTEM_NAME, FLAGS.AstralProjection) as
                | { role?: string }
                | undefined;
            return state?.role === 'body' || state?.role === 'form';
        }

        projectedLinkedActorIds ??= ActorRollDataFlow.collectProjectedLinkedActorIds();
        return !!actor.id && projectedLinkedActorIds.has(actor.id);
    },

    collectProjectedLinkedActorIds() {
        const ids = new Set<string>();
        for (const scene of game.scenes ?? []) {
            for (const token of scene.tokens) {
                if (!token.actorLink || !token.actorId) continue;
                const state = token.getFlag(SYSTEM_NAME, FLAGS.AstralProjection) as { role?: string } | undefined;
                if (state?.role === 'body' || state?.role === 'form') ids.add(token.actorId);
            }
        }
        return ids;
    },
}
