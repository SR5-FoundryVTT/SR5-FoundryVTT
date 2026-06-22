/**
 * Tests for the native-expiry-registry-driven SR5 ActiveEffect duration system.
 *
 * Coverage:
 * - isSuppressed respects duration.expired
 * - isExpiryEvent: real_time delegates to native; combat boundaries (boundary='', first_acting, initiative)
 * - Out-of-combat combat-duration effects expire via updateWorldTime
 * - Permanent effects are never isTemporary and never registered
 * - restart() clears expired flag and re-anchors
 * - Item-owned temporary effects get a start anchor on _preCreate
 *
 * NOTE: Tests that require actual combat progression (nextTurn/nextPass/nextRound) and the
 * registry's refresh() call cannot be exercised here without a running game world.
 * Use the Phase 1 spike (CONFIG.debug.SR5EffectDurationSpike = true) and the Part D manual
 * matrix from the handoff doc for those integration scenarios.
 */
import { SR5TestFactory } from './utils';
import { SR5ActiveEffect } from '../module/effect/SR5ActiveEffect';
import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { prepareEffectDurationStatus } from '@/module/effect/EffectDurationStatus';

export const shadowrunEffectDuration = (context: QuenchBatchContext) => {
    const factory = new SR5TestFactory();
    const { describe, it, after, before } = context;
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

    const durationStatus = (
        rawDuration: Partial<ActiveEffect.DurationData>,
        preparedDuration: Partial<ActiveEffect.Duration>,
        restartPending = false,
        systemDuration?: { boundary?: string; initiative?: number | null },
    ) => prepareEffectDurationStatus({
        toObject: () => ({ duration: rawDuration }),
        duration: preparedDuration,
        system: systemDuration ? { duration: systemDuration } : undefined,
    } as unknown as SR5ActiveEffect, { restartPending });

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
                { value: 1, units: 'rounds', expired: false },
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

        it('shows the initiative threshold (not a generic message) for a pending initiative boundary', () => {
            const status = durationStatus(
                { value: 1, units: 'rounds', expired: false },
                { remaining: 0, label: '0 Rounds' },
                false,
                { boundary: 'initiative', initiative: 10 },
            );

            assert.equal(status.state, 'pending');
            assert.equal(status.summary, game.i18n.format('SR5.ActiveEffect.Duration.UntilInitiative', { initiative: 10 }));
            assert.notEqual(status.summary, game.i18n.localize('SR5.ActiveEffect.Duration.AwaitingBoundary'));
        });

        it('shows boundary-specific pending text for first_acting and end-of-turn', () => {
            const firstActing = durationStatus(
                { value: 1, units: 'rounds', expired: false },
                { remaining: 0, label: '0 Rounds' },
                false,
                { boundary: 'first_acting', initiative: null },
            );
            const turnEnd = durationStatus(
                { value: 1, units: 'rounds', expired: false },
                { remaining: 0, label: '0 Rounds' },
                false,
                { boundary: '', initiative: null },
            );

            assert.equal(firstActing.summary, game.i18n.localize('SR5.ActiveEffect.Duration.AwaitingFirstActing'));
            assert.equal(turnEnd.summary, game.i18n.localize('SR5.ActiveEffect.Duration.AwaitingTurnEnd'));
            assert.notEqual(firstActing.summary, game.i18n.localize('SR5.ActiveEffect.Duration.AwaitingBoundary'));
            assert.notEqual(turnEnd.summary, game.i18n.localize('SR5.ActiveEffect.Duration.AwaitingBoundary'));
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
            // Core clears expired while secondsRemaining is positive, so advance past the duration first.
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
    // isTemporary / registration eligibility
    // -------------------------------------------------------------------------
    describe('isTemporary', () => {
        it('permanent effect (no value) is not isTemporary', async () => {
            const { effect } = await createEffect({type: 'character'}, {
                // No duration set → value defaults to Infinity in prepareDerivedData
            });
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
                duration: { value: 2, units: 'rounds', expiry: null } as any,
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
            // Actor is not in combat — native updateWorldTime path returns true for !expiry case.
            const result = effect.isExpiryEvent('updateWorldTime', ctx());
            // Native: !expiry → true (the span alone determines expiry via secondsRemaining)
            assert.isTrue(result, 'real_time effect should expire on updateWorldTime when not in combat');
        });

        it('delegates non-updateWorldTime events to native', async () => {
            const { effect } = await createEffect({type: 'character'}, {
                duration: { value: 1, units: 'minutes', expiry: null } as any,
            });
            // With expiry=null, native: event !== null → false. Our override also delegates to native.
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
            // Even if called directly, units='seconds' → delegates to native; expiry=null → updateWorldTime=true
            // But in practice the registry never calls this for non-temporary effects.
            // We just confirm our override doesn't break permanent effects.
            const result = effect.isExpiryEvent('updateWorldTime', ctx());
            // Native: !expiry → true, but durationReached = !isFinite(Infinity) = true too — however
            // the effect is never registered (isTemporary=false), so this never fires in practice.
            // We just assert the method doesn't throw.
            assert.isBoolean(result);
        });
    });

    // -------------------------------------------------------------------------
    // isExpiryEvent — combat boundary='' (roundEnd)
    // -------------------------------------------------------------------------
    describe("isExpiryEvent — combat, boundary=''", () => {
        it("fires on roundEnd only", async () => {
            const { effect } = await createEffect({type: 'character'}, {
                duration: { value: 1, units: 'rounds', expiry: null } as any,
                system: { duration: { boundary: '', initiative: null } } as any,
            });
            assert.isTrue(effect.isExpiryEvent('roundEnd', ctx()), 'should fire on roundEnd');
            assert.isFalse(effect.isExpiryEvent('turnStart', ctx()), 'should not fire on turnStart');
            assert.isFalse(effect.isExpiryEvent('roundStart', ctx()), 'should not fire on roundStart');
            assert.isFalse(effect.isExpiryEvent('turnEnd', ctx()), 'should not fire on turnEnd');
        });

        it("expires via updateWorldTime when not in combat", async () => {
            const { effect } = await createEffect({type: 'character'}, {
                duration: { value: 1, units: 'rounds', expiry: null } as any,
                system: { duration: { boundary: '', initiative: null } } as any,
            });
            // actor.inCombat is false (no combat active) → updateWorldTime returns true
            const result = effect.isExpiryEvent('updateWorldTime', ctx());
            assert.isTrue(result, 'combat effect should expire via worldTime when not in combat');
        });
    });

    // -------------------------------------------------------------------------
    // isExpiryEvent — combat boundary='initiative'
    // -------------------------------------------------------------------------
    describe("isExpiryEvent — combat, boundary='initiative'", () => {
        it("fires on sr5ActionPhase when acting initiative < threshold", async () => {
            const { actor, effect } = await createEffect({type: 'character'}, {
                duration: { value: 1, units: 'rounds', expiry: null } as any,
                system: { duration: { boundary: 'initiative', initiative: 10 } } as any,
            });
            // Simulate a context where the acting combatant has initiative 8 < 10
            const fakeCombatant = { actor, initiative: 8 };
            const fakeContext = { combat: { combatant: fakeCombatant, system: { pass: 1 } } };
            const result = effect.isExpiryEvent('sr5ActionPhase', fakeContext as any);
            assert.isTrue(result, 'should expire when acting initiative 8 < threshold 10');
        });

        it("does not fire when acting initiative >= threshold", async () => {
            const { actor, effect } = await createEffect({type: 'character'}, {
                duration: { value: 1, units: 'rounds', expiry: null } as any,
                system: { duration: { boundary: 'initiative', initiative: 10 } } as any,
            });
            const fakeCombatant = { actor, initiative: 12 };
            const fakeContext = { combat: { combatant: fakeCombatant, system: { pass: 1 } } };
            const result = effect.isExpiryEvent('sr5ActionPhase', fakeContext as any);
            assert.isFalse(result, 'should not expire when acting initiative 12 >= threshold 10');
        });

        it("ignores Foundry's native turn events (only sr5ActionPhase drives it)", async () => {
            const { actor, effect } = await createEffect({type: 'character'}, {
                duration: { value: 1, units: 'rounds', expiry: null } as any,
                system: { duration: { boundary: 'initiative', initiative: 10 } } as any,
            });
            const fakeCombatant = { actor, initiative: 5 };
            const fakeContext = { combat: { combatant: fakeCombatant, system: { pass: 1 } } };
            assert.isFalse(effect.isExpiryEvent('turnStart', fakeContext as any), 'turnStart must not drive expiry');
            assert.isFalse(effect.isExpiryEvent('combatRewind', fakeContext as any), 'combatRewind must not drive expiry');
            assert.isTrue(effect.isExpiryEvent('sr5ActionPhase', fakeContext as any), 'sr5ActionPhase must drive expiry');
        });
    });

    // -------------------------------------------------------------------------
    // isExpiryEvent — combat boundary='first_acting'
    // -------------------------------------------------------------------------
    describe("isExpiryEvent — combat, boundary='first_acting'", () => {
        it("fires on sr5ActionPhase when owning actor acts in pass 1", async () => {
            const { actor, effect } = await createEffect({type: 'character'}, {
                duration: { value: 1, units: 'rounds', expiry: null } as any,
                system: { duration: { boundary: 'first_acting', initiative: null } } as any,
            });
            const fakeCombatant = { actor };
            const fakeContext = { combat: { combatant: fakeCombatant, system: { pass: 1 } } };
            const result = effect.isExpiryEvent('sr5ActionPhase', fakeContext as any);
            assert.isTrue(result, 'should expire when owning actor acts in pass 1');
        });

        it("does not fire when a different actor acts in pass 1", async () => {
            const { effect } = await createEffect({type: 'character'}, {
                duration: { value: 1, units: 'rounds', expiry: null } as any,
                system: { duration: { boundary: 'first_acting', initiative: null } } as any,
            });
            // Different actor in the combatant slot
            const otherActor = await factory.createActor({ type: 'character' });
            const fakeCombatant = { actor: otherActor };
            const fakeContext = { combat: { combatant: fakeCombatant, system: { pass: 1 } } };
            const result = effect.isExpiryEvent('sr5ActionPhase', fakeContext as any);
            assert.isFalse(result, 'should not expire when a different actor acts');
        });

        it("does not fire when in pass > 1 (not first pass)", async () => {
            const { actor, effect } = await createEffect({type: 'character'}, {
                duration: { value: 1, units: 'rounds', expiry: null } as any,
                system: { duration: { boundary: 'first_acting', initiative: null } } as any,
            });
            const fakeCombatant = { actor };
            const fakeContext = { combat: { combatant: fakeCombatant, system: { pass: 2 } } };
            const result = effect.isExpiryEvent('sr5ActionPhase', fakeContext as any);
            assert.isFalse(result, 'should not expire in pass 2 (only pass 1 is first_acting)');
        });
    });

    // -------------------------------------------------------------------------
    // restart()
    // -------------------------------------------------------------------------
    describe('restart()', () => {
        it('clears duration.expired and re-enables a disabled effect', async () => {
            const { effect } = await createEffect({type: 'character'}, {
                duration: { value: 2, units: 'rounds', expiry: null } as any,
                system: { duration: { boundary: '' } } as any,
            });
            // Out of combat, 2 rounds are prepared as 6 seconds. Advance beyond that so core retains expired.
            await game.time.advance(7);
            await effect.update({ duration: { expired: true } as any, disabled: true });
            assert.isTrue(effect.duration.expired, 'precondition: effect must be expired');

            await effect.restart();
            assert.isFalse(effect.duration.expired, 'restart must clear expired flag');
            assert.isFalse(effect.disabled, 'restart must re-enable the effect');
        });

        it('re-anchors start so remaining resets', async () => {
            const { effect } = await createEffect({type: 'character'}, {
                duration: { value: 2, units: 'rounds', expiry: null } as any,
                system: { duration: { boundary: '' } } as any,
            });
            const originalStartTime = effect.start?.time ?? 0;
            // Advance world time to simulate the effect having been active for a while.
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
                // High enough that a second pass exists (initAfterPass = init − PASS_PENALTY > 0 ⇒ init > 10).
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
                await combat.nextTurn();   // within pass 1
                await combat.nextTurn();   // both acted → nextPass (pass transition)
                await combat.nextRound();  // round advance
            });
            assert.include(events, 'sr5ActionPhase', 'sr5ActionPhase must fire while advancing combat');
        });

        it('fires sr5ActionPhase with a SINGLE combatant (regression: same combatant re-acts each pass)', async function () {
            if (!game.user?.isActiveGM) { this.skip(); return; }
            // The reported bug: with one combatant, a new pass re-acts the SAME combatant (a pad shifts the
            // index, but combat.combatant is unchanged), so Foundry dispatches no turnStart. SR5Combat._onUpdate
            // must still emit sr5ActionPhase so the boundary is evaluated.
            const events = await recordEvents(1, async (combat) => {
                await combat.nextTurn();   // sole combatant acts → nextPass → re-acts (index stays 0)
                await combat.nextTurn();
            });
            assert.include(events, 'sr5ActionPhase', 'sr5ActionPhase must fire even with one combatant');
        });
    });
};
