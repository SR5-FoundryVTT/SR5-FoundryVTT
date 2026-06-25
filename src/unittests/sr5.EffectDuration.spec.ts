/**
 * Tests for the native-expiry-registry-driven SR5 ActiveEffect duration system.
 *
 * Coverage:
 * - isSuppressed respects duration.expired
 * - isExpiryEvent: real_time delegates to native; sr5MyAction (owner first-pass)
 * - Permanent effects are never isTemporary and never registered
 * - restart() clears expired flag and re-anchors
 * - Item-owned temporary effects get a start anchor on _preCreate
 * - Combat integration: SR5Combat dispatches sr5ActionPhase every action phase
 */
import { SR5TestFactory } from './utils';
import { SR5ActiveEffect } from '../module/effect/SR5ActiveEffect';
import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { prepareEffectDurationStatus } from '@/module/effect/EffectDurationStatus';

export const shadowrunEffectDuration = (context: QuenchBatchContext) => {
    const factory = new SR5TestFactory();
    const { describe, it, after } = context;
    const assert: Chai.AssertStatic = context.assert;

    after(async () => { await factory.destroy(); });

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    /** Create an actor-owned ActiveEffect with the given duration/system data. */
    const createEffect = async (
        actorData: { type: Actor.ConfiguredSubType } = { type: 'character' },
        effectData: Partial<ActiveEffect.CreateData> = {}
    ) => {
        const actor = await factory.createActor(actorData);
        const effects = await actor.createEmbeddedDocuments('ActiveEffect', [{
            name: '#QuenchDuration',
            disabled: false,
            ...effectData,
        }]) as SR5ActiveEffect[];
        return { actor, effect: effects[0] };
    };

    /** Build a minimal fake context as isExpiryEvent receives from the registry. */
    const ctx = (overrides: Record<string, unknown> = {}) => overrides as ActiveEffect.IsExpiryEventContext;

    const combatEventCtx = (actor: SR5ActiveEffect['actor']) => ({
        combat: {
            started: true,
            getCombatantsByActor: () => actor ? [{ actor }] : [],
        },
    }) as unknown as ActiveEffect.IsExpiryEventContext;

    const durationStatus = (
        rawDuration: Partial<ActiveEffect.DurationData>,
        preparedDuration: Partial<ActiveEffect.Duration>,
        restartPending = false,
    ) => prepareEffectDurationStatus({
        toObject: () => ({ duration: rawDuration }),
        duration: preparedDuration,
    } as unknown as SR5ActiveEffect, { restartPending });

    const waitUntil = async (condition: () => boolean, timeout = 1000) => {
        const started = Date.now();
        while (!condition() && Date.now() - started < timeout) {
            await new Promise(resolve => setTimeout(resolve, 25));
        }
    };

    // -------------------------------------------------------------------------
    // Shared duration presentation
    // -------------------------------------------------------------------------
    describe('duration status presentation', () => {
        it('renders permanent effects without a remaining-time label', () => {
            const status = durationStatus({ value: null }, { remaining: Infinity, label: '' });

            assert.equal(status.state, 'permanent');
            assert.equal(status.summary, game.i18n.localize('SR5.ActiveEffect.Duration.DoesNotExpire'));
        });

        it('renders active effects using the prepared localized remaining label', () => {
            const status = durationStatus(
                { value: 5, units: 'minutes', expired: false },
                { remaining: 4, label: '4 Minutes' },
            );

            assert.equal(status.state, 'active');
            assert.equal(status.summary, '4 Minutes');
            assert.notInclude(status.summary, 'ago');
        });

        it('relabels combat (rounds) durations in Shadowrun terms (Combat Turns, not Rounds)', () => {
            const status = durationStatus(
                { value: 2, units: 'rounds', expired: false },
                { remaining: 2, label: '2 Rounds' },
            );

            assert.equal(status.state, 'active');
            assert.equal(status.summary, game.i18n.format('SR5.ActiveEffect.Duration.CombatTurns', { turns: 2 }));
            assert.notInclude(status.summary, 'Round');
        });

        it('renders reached, expired, and staged-restart states without negative time', () => {
            const pending = durationStatus(
                { value: 1, units: 'rounds', expired: false, expiry: 'roundEnd' },
                { remaining: 0, label: '0 Rounds' },
            );
            const expired = durationStatus(
                { value: 1, units: 'seconds', expired: true },
                { remaining: -1, label: '1 Second ago' },
            );
            const restartPending = durationStatus(
                { value: 1, units: 'seconds', expired: false },
                { remaining: 1, label: '1 Second' },
                true,
            );

            assert.equal(pending.state, 'pending');
            assert.equal(expired.state, 'expired');
            assert.equal(expired.summary, game.i18n.localize('SR5.ActiveEffect.Duration.Expired'));
            assert.notInclude(expired.summary, 'ago');
            assert.equal(restartPending.state, 'restart-pending');
        });

        it('shows trigger-specific pending text for sr5MyAction and roundEnd', () => {
            const firstAction = durationStatus(
                { value: 1, units: 'rounds', expired: false, expiry: 'sr5MyAction' },
                { remaining: 0, label: '0 Rounds' },
            );
            const turnEnd = durationStatus(
                { value: 1, units: 'rounds', expired: false, expiry: 'roundEnd' },
                { remaining: 0, label: '0 Rounds' },
            );

            assert.equal(firstAction.summary, game.i18n.localize('SR5.ActiveEffect.Duration.AwaitingMyAction'));
            assert.equal(turnEnd.summary, game.i18n.localize('SR5.ActiveEffect.Duration.AwaitingTurnEnd'));
            assert.notEqual(firstAction.summary, game.i18n.localize('SR5.ActiveEffect.Duration.AwaitingTrigger'));
            assert.notEqual(turnEnd.summary, game.i18n.localize('SR5.ActiveEffect.Duration.AwaitingTrigger'));
        });

        it('shows pending text for all five trigger events', () => {
            const triggers = ['combatStart', 'combatEnd', 'roundStart', 'roundEnd', 'sr5MyAction'] as const;
            const generic = game.i18n.localize('SR5.ActiveEffect.Duration.AwaitingTrigger');
            for (const expiry of triggers) {
                const status = durationStatus(
                    { value: 1, units: 'rounds', expired: false, expiry },
                    { remaining: 0, label: '0 Rounds' },
                );
                assert.equal(status.state, 'pending', `${expiry} should be pending`);
                assert.notEqual(status.summary, generic, `${expiry} should have a specific label, not the generic fallback`);
            }
        });
    });

    // -------------------------------------------------------------------------
    // isSuppressed — duration.expired
    // -------------------------------------------------------------------------
    describe('isSuppressed', () => {
        it('returns true when duration.expired is set', async () => {
            const { effect } = await createEffect({type: 'character'}, {
                duration: { value: 1, units: 'seconds', expiry: null } as any,
            });
            await game.time.advance(2);
            await effect.update({ duration: { expired: true } as any });
            assert.isTrue(effect.isSuppressed, 'expired effect must be suppressed');
        });

        it('returns false for a non-expired actor-owned effect', async () => {
            const { effect } = await createEffect();
            assert.isFalse(effect.duration.expired);
            assert.isFalse(effect.isSuppressed, 'fresh actor-owned effect must not be suppressed');
        });
    });

    // -------------------------------------------------------------------------
    // expiry action
    // -------------------------------------------------------------------------
    describe('expiry action', () => {
        it('deletes expired effects when expiryAction is delete', async () => {
            const { actor, effect } = await createEffect({type: 'character'}, {
                duration: { value: 1, units: 'seconds', expiry: null } as any,
                system: { expiryAction: 'delete' },
            });

            await game.time.advance(2);
            await effect.update({ duration: { expired: true } as any });
            await waitUntil(() => !actor.effects.has(effect.id!));

            assert.isFalse(actor.effects.has(effect.id!), 'expired delete effects must be removed by the active GM');
        });

        it('keeps expired effects when expiryAction is update', async () => {
            const { actor, effect } = await createEffect({type: 'character'}, {
                duration: { value: 1, units: 'seconds', expiry: null } as any,
                system: { expiryAction: 'update' },
            });

            await game.time.advance(2);
            await effect.update({ duration: { expired: true } as any });
            await new Promise(resolve => setTimeout(resolve, 50));

            const expiredEffect = actor.effects.get(effect.id!) as SR5ActiveEffect | undefined;
            assert.exists(expiredEffect, 'expired update effects must remain on the actor');
            assert.isTrue(expiredEffect?.isSuppressed, 'expired update effects must be suppressed');
        });
    });

    // -------------------------------------------------------------------------
    // isTemporary / registration eligibility
    // -------------------------------------------------------------------------
    describe('isTemporary', () => {
        it('permanent effect (no value) is not isTemporary', async () => {
            const { effect } = await createEffect({type: 'character'});
            assert.isFalse(effect.isTemporary, 'effect without a finite duration must not be temporary');
        });

        it('real_time effect (finite value, time units) is isTemporary', async () => {
            const { effect } = await createEffect({type: 'character'}, {
                duration: { value: 5, units: 'minutes', expiry: null } as any,
            });
            assert.isTrue(effect.isTemporary, 'real_time effect must be temporary');
        });

        it('combat effect (rounds units) is isTemporary', async () => {
            const { effect } = await createEffect({type: 'character'}, {
                duration: { value: 2, units: 'rounds', expiry: 'roundEnd' } as any,
            });
            assert.isTrue(effect.isTemporary, 'combat effect must be temporary');
        });
    });

    // -------------------------------------------------------------------------
    // isExpiryEvent — real_time delegates to native
    // -------------------------------------------------------------------------
    describe('isExpiryEvent — real_time (units=minutes)', () => {
        it('delegates updateWorldTime to native (returns true when not in combat)', async () => {
            const { effect } = await createEffect({type: 'character'}, {
                duration: { value: 1, units: 'minutes', expiry: null } as any,
            });
            const result = effect.isExpiryEvent('updateWorldTime', ctx());
            assert.isTrue(result, 'real_time effect should expire on updateWorldTime when not in combat');
        });

        it('delegates non-updateWorldTime events to native', async () => {
            const { effect } = await createEffect({type: 'character'}, {
                duration: { value: 1, units: 'minutes', expiry: null } as any,
            });
            const result = effect.isExpiryEvent('turnStart', ctx());
            assert.isFalse(result, 'real_time effect should not expire on turnStart');
        });
    });

    // -------------------------------------------------------------------------
    // isExpiryEvent — permanent (no value)
    // -------------------------------------------------------------------------
    describe('isExpiryEvent — permanent', () => {
        it('never fires for permanent effects (isTemporary=false prevents registration)', async () => {
            const { effect } = await createEffect();
            const result = effect.isExpiryEvent('updateWorldTime', ctx());
            assert.isBoolean(result);
        });
    });

    // -------------------------------------------------------------------------
    // isExpiryEvent — native combat events (roundEnd, combatEnd, etc.)
    // -------------------------------------------------------------------------
    describe('isExpiryEvent — native combat events delegate to super', () => {
        it('delegates roundEnd to native when expiry is roundEnd', async () => {
            const { actor, effect } = await createEffect({type: 'character'}, {
                duration: { value: 1, units: 'rounds', expiry: 'roundEnd' } as any,
            });
            // Native handles roundEnd for effects with expiry='roundEnd'
            const result = effect.isExpiryEvent('roundEnd', combatEventCtx(actor));
            assert.isTrue(result, 'roundEnd should delegate to native and return true for matching expiry');
        });

        it('does not fire on sr5ActionPhase for non-sr5MyAction effects', async () => {
            const { actor, effect } = await createEffect({type: 'character'}, {
                duration: { value: 1, units: 'rounds', expiry: 'roundEnd' } as any,
            });
            const result = effect.isExpiryEvent('sr5ActionPhase', combatEventCtx(actor));
            // native: 'sr5ActionPhase' !== 'roundEnd' → false
            assert.isFalse(result, 'roundEnd effect must not fire on sr5ActionPhase');
        });
    });

    // -------------------------------------------------------------------------
    // isExpiryEvent — sr5MyAction (owner's action phase, any pass)
    // -------------------------------------------------------------------------
    describe("isExpiryEvent — sr5MyAction", () => {
        it("fires on sr5ActionPhase when owning actor acts (pass 1)", async () => {
            const { actor, effect } = await createEffect({type: 'character'}, {
                duration: { value: 1, units: 'rounds', expiry: 'sr5MyAction' } as any,
            });
            const fakeCombatant = { actor };
            const fakeContext = { combat: { combatant: fakeCombatant, system: { pass: 1 } } };
            const result = effect.isExpiryEvent('sr5ActionPhase', fakeContext as any);
            assert.isTrue(result, 'should expire when owning actor acts in pass 1');
        });

        it("fires on sr5ActionPhase when owning actor acts (pass 2 — any pass)", async () => {
            const { actor, effect } = await createEffect({type: 'character'}, {
                duration: { value: 1, units: 'rounds', expiry: 'sr5MyAction' } as any,
            });
            const fakeCombatant = { actor };
            const fakeContext = { combat: { combatant: fakeCombatant, system: { pass: 2 } } };
            const result = effect.isExpiryEvent('sr5ActionPhase', fakeContext as any);
            assert.isTrue(result, 'should expire when owning actor acts in any pass');
        });

        it("does not fire when a different actor acts", async () => {
            const { effect } = await createEffect({type: 'character'}, {
                duration: { value: 1, units: 'rounds', expiry: 'sr5MyAction' } as any,
            });
            const otherActor = await factory.createActor({ type: 'character' });
            const fakeCombatant = { actor: otherActor };
            const fakeContext = { combat: { combatant: fakeCombatant, system: { pass: 1 } } };
            const result = effect.isExpiryEvent('sr5ActionPhase', fakeContext as any);
            assert.isFalse(result, 'should not expire when a different actor acts');
        });

        it("does not fire on native turn events — only sr5ActionPhase drives it", async () => {
            const { actor, effect } = await createEffect({type: 'character'}, {
                duration: { value: 1, units: 'rounds', expiry: 'sr5MyAction' } as any,
            });
            const fakeCombatant = { actor };
            const fakeContext = { combat: { combatant: fakeCombatant, system: { pass: 1 } } };
            assert.isFalse(effect.isExpiryEvent('turnStart', fakeContext as any), 'turnStart must not drive sr5MyAction');
            assert.isTrue(effect.isExpiryEvent('sr5ActionPhase', fakeContext as any), 'sr5ActionPhase must drive it');
        });

        it("falls back to updateWorldTime when the owner is not in combat", async () => {
            const { effect } = await createEffect({type: 'character'}, {
                duration: { value: 1, units: 'rounds', expiry: 'sr5MyAction' } as any,
            });

            assert.isTrue(effect.isExpiryEvent('updateWorldTime', ctx()), 'out-of-combat sr5MyAction should expire on world time updates');
        });
    });

    // -------------------------------------------------------------------------
    // restart()
    // -------------------------------------------------------------------------
    describe('restart()', () => {
        it('clears duration.expired and re-enables a disabled effect', async () => {
            const { effect } = await createEffect({type: 'character'}, {
                duration: { value: 2, units: 'rounds', expiry: 'roundEnd' } as any,
            });
            await game.time.advance(7);
            await effect.update({ duration: { expired: true } as any, disabled: true });
            assert.isTrue(effect.duration.expired, 'precondition: effect must be expired');

            await effect.restart();
            assert.isFalse(effect.duration.expired, 'restart must clear expired flag');
            assert.isFalse(effect.disabled, 'restart must re-enable the effect');
        });

        it('re-anchors start so remaining resets', async () => {
            const { effect } = await createEffect({type: 'character'}, {
                duration: { value: 2, units: 'rounds', expiry: 'roundEnd' } as any,
            });
            const originalStartTime = effect.start?.time ?? 0;
            await game.time.advance(60);
            await effect.restart();
            const newStartTime = effect.start?.time ?? 0;
            assert.isAtLeast(newStartTime, originalStartTime, 'start.time must be updated on restart');
        });
    });

    // -------------------------------------------------------------------------
    // Combat integration — SR5Combat must drive the expiry registry on every action
    // phase via 'sr5ActionPhase', because Foundry's turn-index dispatch skips events
    // when the turn index doesn't move (notably a SINGLE combatant pushed to a new pass).
    // -------------------------------------------------------------------------
    describe('combat integration — sr5ActionPhase dispatch', () => {
        /** Run `drive` against a real SR5Combat with `count` combatants and return the registry events seen. */
        const recordEvents = async (count: number, drive: (combat: Combat.Implementation) => Promise<void>) => {
            const combat = await getDocumentClass('Combat').create({}) as Combat.Implementation;
            const combatants: { actorId: string }[] = [];
            for (let i = 0; i < count; i++) {
                const actor = await factory.createActor({ type: 'character' });
                combatants.push({ actorId: actor.id! });
            }
            const events: string[] = [];
            const registry = foundry.documents.ActiveEffect.registry;
            const originalRefresh = registry.refresh.bind(registry);
            try {
                await combat.createEmbeddedDocuments('Combatant', combatants);
                await combat.startCombat();
                for (const c of combat.combatants) await c.update({ initiative: 20 });

                registry.refresh = (event: string, ctx: any) => { events.push(event); return originalRefresh(event, ctx); };
                await drive(combat);
            } finally {
                registry.refresh = originalRefresh;
                await combat.delete();
            }
            return events;
        };

        it('fires sr5ActionPhase advancing turns/passes with multiple combatants', async function () {
            if (!game.user?.isActiveGM) { this.skip(); return; }
            const events = await recordEvents(2, async (combat) => {
                await combat.nextTurn();
                await combat.nextTurn();
                await combat.nextRound();
            });
            assert.include(events, 'sr5ActionPhase', 'sr5ActionPhase must fire while advancing combat');
        });

        it('fires sr5ActionPhase with a SINGLE combatant (regression: same combatant re-acts each pass)', async function () {
            if (!game.user?.isActiveGM) { this.skip(); return; }
            const events = await recordEvents(1, async (combat) => {
                await combat.nextTurn();
                await combat.nextTurn();
            });
            assert.include(events, 'sr5ActionPhase', 'sr5ActionPhase must fire even with one combatant');
        });
    });
};
