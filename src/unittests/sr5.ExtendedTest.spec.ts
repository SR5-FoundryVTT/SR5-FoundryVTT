import { QuenchBatchContext } from "@ethaks/fvtt-quench";
import { SR5TestFactory } from "./utils";
import { ExtendedTestFlow } from "@/module/flows/ExtendedTestFlow";
import { ExtendedTestDueFlow } from "@/module/flows/ExtendedTestDueFlow";
import { ExtendedTestRules } from "@/module/rules/ExtendedTestRules";
import { ExtendedTestStorage } from "@/module/storage/ExtendedTestStorage";
import { WorldTimeFlow } from "@/module/flows/WorldTimeFlow";
import { intervalToSeconds } from "@/module/utils/timeUnits";
import { ExtendedTestRecord } from "@/module/types/flows/ExtendedTest";
import { TestCreator } from "@/module/tests/TestCreator";
import { FLAGS, SR, SYSTEM_NAME } from "@/module/constants";

export const shadowrunExtendedTests = (context: QuenchBatchContext) => {
    const { describe, it, afterEach, after } = context;
    const assert: Chai.AssertStatic = context.assert;

    const factory = new SR5TestFactory();
    after(async () => { await factory.destroy(); });

    const createdIds: string[] = [];

    const createRecord = async (params: Partial<Parameters<typeof ExtendedTestFlow.create>[0]> = {}) => {
        const record = await ExtendedTestFlow.create({
            name: 'Quench Extended Test',
            dicePool: 20,
            threshold: 4,
            interval: { value: 1, unit: 'hours' },
            ...params,
        });
        createdIds.push(record.id);
        return record;
    };

    /** A record built in memory, for the rules and predicates that are pure over one. */
    const baseRecord = (overrides: Partial<ExtendedTestRecord> = {}): ExtendedTestRecord => ({
        id: 'test',
        name: 'Test',
        notes: '',
        creatorUserId: 'creator',
        testType: 'SuccessTest',
        dicePool: 10,
        cumulativeModifier: true,
        threshold: 5,
        accumulatedHits: 0,
        rollCount: 0,
        interval: { value: 1, unit: 'hours' },
        advanceTimeOnRoll: false,
        status: 'active',
        permissions: { visibility: 'gmAndOwner', visibleUsers: [], editUsers: [], rollUsers: [] },
        createdAt: 0,
        createdWorldTime: 0,
        updatedAt: 0,
        rolls: [],
        log: [],
        ...overrides,
    });

    afterEach(async () => {
        while (createdIds.length) {
            await ExtendedTestStorage.delete(createdIds.pop()!);
        }
    });

    describe('Extended Test Storage', () => {
        it('round trips records and keeps other records intact on delete', async () => {
            const first = await createRecord({ name: 'First' });
            const second = await createRecord({ name: 'Second' });

            assert.strictEqual(ExtendedTestStorage.get(first.id)?.name, 'First');
            assert.strictEqual(ExtendedTestStorage.get(second.id)?.name, 'Second');

            first.accumulatedHits = 3;
            await ExtendedTestStorage.setRecord(first);

            assert.strictEqual(ExtendedTestStorage.get(first.id)?.accumulatedHits, 3);
            assert.strictEqual(ExtendedTestStorage.get(second.id)?.accumulatedHits, 0);

            await ExtendedTestStorage.delete(first.id);
            assert.isUndefined(ExtendedTestStorage.get(first.id));
            assert.strictEqual(ExtendedTestStorage.get(second.id)?.name, 'Second');
        });
    });

    describe('Extended Test Rules', () => {
        /**
         * A test data snapshot as ExtendedTestFlow._prepareRollData leaves it: pool.value is
         * the total actually rolled, with the cumulative modifier of that roll among changes.
         */
        const snapshotTestData = (value: number, extendedModifier: number) => ({
            pool: {
                value,
                changes: [{ name: 'SR5.ExtendedTest', value: extendedModifier, enabled: true }],
            },
        }) as any;

        it('applies the cumulative dice pool modifier per roll', () => {
            const record = baseRecord();
            assert.strictEqual(ExtendedTestRules.nextPool(record), 10);
            record.rollCount = 3;
            assert.strictEqual(ExtendedTestRules.nextPool(record), 7);
            record.rollCount = 15;
            assert.strictEqual(ExtendedTestRules.nextPool(record), 0);
            record.cumulativeModifier = false;
            assert.strictEqual(ExtendedTestRules.nextPool(record), 10);
        });

        it('prefers the test data snapshot pool over the starting pool', () => {
            // Manually created records have no snapshot and use plain starting pool math.
            assert.strictEqual(ExtendedTestRules.nextPool(baseRecord({ rollCount: 2 })), 8);

            // A snapshot rolled as the second roll carries a -1 of its own. The third roll
            // replaces it with -2, so a base 5 pool ends up at 3.
            const snapshot = baseRecord({
                rollCount: 2,
                testData: snapshotTestData(4, -1),
            });
            assert.strictEqual(ExtendedTestRules.nextPool(snapshot), 3);
        });

        it('drops the snapshot modifier when the cumulative modifier is turned off', () => {
            // The snapshot still carries the -2 it was rolled with, but the next roll will
            // remove it entirely, so the manager has to show the full pool.
            const record = baseRecord({
                rollCount: 3,
                cumulativeModifier: false,
                testData: snapshotTestData(8, -2),
            });

            assert.strictEqual(ExtendedTestRules.nextPool(record), 10);
        });

        it('detects completion and continuation', () => {
            const record = baseRecord({ accumulatedHits: 5 });
            assert.isTrue(ExtendedTestRules.isComplete(record));
            assert.isFalse(ExtendedTestRules.canContinue(record));

            const exhausted = baseRecord({ rollCount: 10 });
            assert.isFalse(ExtendedTestRules.canContinue(exhausted));

            const running = baseRecord({ accumulatedHits: 3, rollCount: 2 });
            assert.isFalse(ExtendedTestRules.isComplete(running));
            assert.isTrue(ExtendedTestRules.canContinue(running));
        });

        it('calculates progress towards the threshold', () => {
            assert.strictEqual(ExtendedTestRules.progress(baseRecord({ accumulatedHits: 2, threshold: 4 })), 50);
            assert.strictEqual(ExtendedTestRules.progress(baseRecord({ accumulatedHits: 8, threshold: 4 })), 100);
            assert.isUndefined(ExtendedTestRules.progress(baseRecord({ threshold: 0 })));
        });

        it('converts intervals to seconds, including combat rounds', () => {
            assert.strictEqual(intervalToSeconds({ value: 2, unit: 'minutes' }), 120);
            assert.strictEqual(intervalToSeconds({ value: 1, unit: 'days' }), 86400);
            assert.strictEqual(intervalToSeconds({ value: 0, unit: 'hours' }), 0);
            const roundSeconds = CONFIG.time.roundTime || SR.combat.ROUND_TIME_SECONDS;
            assert.strictEqual(intervalToSeconds({ value: 2, unit: 'rounds' }), 2 * roundSeconds);
        });

        it('calculates elapsed intervals from world time', () => {
            const record = baseRecord({ createdWorldTime: 0, interval: { value: 1, unit: 'hours' } });
            assert.strictEqual(ExtendedTestRules.intervalsElapsed(record, 0), 0);
            assert.strictEqual(ExtendedTestRules.intervalsElapsed(record, 3599), 0);
            assert.strictEqual(ExtendedTestRules.intervalsElapsed(record, 7200), 2);
            record.lastRollWorldTime = 7200;
            assert.strictEqual(ExtendedTestRules.intervalsElapsed(record, 10800), 1);
        });

        it('ends the test on a critical glitch', () => {
            const record = baseRecord({
                rolls: [{
                    hits: 1, glitch: true, criticalGlitch: true, poolUsed: 10,
                    timestamp: 0, worldTime: 0, userId: 'creator',
                }],
                rollCount: 1,
                accumulatedHits: 1,
            });

            assert.isTrue(ExtendedTestRules.isCriticalGlitchEnd(record));
            ExtendedTestFlow._applyStatusTransitions(record);
            assert.strictEqual(record.status, 'failed');
            assert.isTrue(record.log.some(entry => entry.detail === 'criticalGlitch'));
        });

        it('completes an open ended record once its pool runs out', () => {
            const open = baseRecord({ threshold: 0, rollCount: 10 });
            assert.isTrue(ExtendedTestRules.isOpenEnded(open));
            assert.isFalse(ExtendedTestRules.canContinue(open));

            ExtendedTestFlow._applyStatusTransitions(open);
            assert.strictEqual(open.status, 'completed');

            // A thresholded record in the same spot did fail to reach its threshold.
            const thresholded = baseRecord({ rollCount: 10 });
            ExtendedTestFlow._applyStatusTransitions(thresholded);
            assert.strictEqual(thresholded.status, 'failed');
        });

        it('only allows a roll once the interval has passed', () => {
            const record = baseRecord({ interval: { value: 1, unit: 'hours' }, lastRollWorldTime: 0 });

            // The first roll is always allowed, no time needs to pass for it.
            assert.isTrue(ExtendedTestRules.intervalAllowsRoll(record, 0));

            record.rollCount = 1;
            assert.isFalse(ExtendedTestRules.intervalAllowsRoll(record, 3599));
            assert.isTrue(ExtendedTestRules.intervalAllowsRoll(record, 3600));

            // Records without an interval are never gated.
            record.interval = { value: 0, unit: 'hours' };
            assert.isTrue(ExtendedTestRules.intervalAllowsRoll(record, 0));
        });

        it('re-anchors the interval when world time is rewound past the last roll', () => {
            const record = baseRecord({
                interval: { value: 1, unit: 'hours' },
                lastRollWorldTime: 7200,
                rollCount: 1,
            });

            // Without the rewind allowance the elapsed clamp would lock this record forever.
            assert.strictEqual(ExtendedTestRules.intervalsElapsed(record, 3600), 0);
            assert.isTrue(ExtendedTestRules.intervalAllowsRoll(record, 3600));
        });

        it('keeps rules and permission changes with the record owner', () => {
            const record = baseRecord({
                permissions: { visibility: 'public', visibleUsers: [], editUsers: ['editor'], rollUsers: [] },
            });
            const editor = { id: 'editor', isGM: false } as User;
            const creator = { id: 'creator', isGM: false } as User;

            assert.isTrue(ExtendedTestRules.canEdit(record, editor));
            assert.isFalse(ExtendedTestRules.canManage(record, editor));
            assert.isFalse(ExtendedTestRules.canDelete(record, editor));

            assert.isTrue(ExtendedTestRules.canManage(record, creator));
            assert.isTrue(ExtendedTestRules.canManage(record, game.user!));
        });

        it('handles permissions for the GM user', () => {
            // Quench runs as GM: full access regardless of visibility.
            const record = baseRecord({ permissions: { visibility: 'gmOnly', visibleUsers: [], editUsers: [], rollUsers: [] } });
            assert.isTrue(ExtendedTestRules.canView(record, game.user!));
            assert.isTrue(ExtendedTestRules.canEdit(record, game.user!));
            assert.isTrue(ExtendedTestRules.canRoll(record, game.user!));
            assert.isTrue(ExtendedTestRules.canDelete(record, game.user!));
        });

        it('respects visibility for non-creator users', () => {
            const user = { id: 'someone', isGM: false } as User;
            const publicRecord = baseRecord({ permissions: { visibility: 'public', visibleUsers: [], editUsers: [], rollUsers: [] } });
            const gmOnlyRecord = baseRecord({ permissions: { visibility: 'gmOnly', visibleUsers: [], editUsers: [], rollUsers: [] } });
            const selectedRecord = baseRecord({ permissions: { visibility: 'selectedUsers', visibleUsers: ['someone'], editUsers: [], rollUsers: [] } });

            assert.isTrue(ExtendedTestRules.canView(publicRecord, user));
            assert.isFalse(ExtendedTestRules.canEdit(publicRecord, user));
            assert.isFalse(ExtendedTestRules.canRoll(publicRecord, user));
            assert.isFalse(ExtendedTestRules.canView(gmOnlyRecord, user));
            assert.isTrue(ExtendedTestRules.canView(selectedRecord, user));

            const creator = { id: 'creator', isGM: false } as User;
            assert.isTrue(ExtendedTestRules.canView(gmOnlyRecord, creator));
            assert.isTrue(ExtendedTestRules.canEdit(gmOnlyRecord, creator));
            assert.isTrue(ExtendedTestRules.canRoll(gmOnlyRecord, creator));
        });
    });

    describe('Extended Test Due Messages', () => {
        const HOUR = 3600;

        it('announces a record once an interval has passed', () => {
            const record = baseRecord({ rollCount: 1, lastRollWorldTime: 0 });

            assert.isFalse(ExtendedTestDueFlow.shouldAnnounce(record, HOUR - 1));
            assert.isTrue(ExtendedTestDueFlow.shouldAnnounce(record, HOUR));
        });

        it('announces a pending roll only once, however world time moves', () => {
            const record = baseRecord({ rollCount: 1, lastRollWorldTime: 0, dueAnnouncedRollCount: 1 });

            // A GM rewinding and re-advancing must not repeat the card.
            assert.isFalse(ExtendedTestDueFlow.shouldAnnounce(record, HOUR));
            assert.isFalse(ExtendedTestDueFlow.shouldAnnounce(record, HOUR * 20));

            // Rolling re-arms it.
            record.rollCount = 2;
            record.lastRollWorldTime = HOUR * 20;
            assert.isTrue(ExtendedTestDueFlow.shouldAnnounce(record, HOUR * 21));
        });

        it('stays quiet for records that cannot be rolled', () => {
            const due = { rollCount: 1, lastRollWorldTime: 0 };

            assert.isFalse(ExtendedTestDueFlow.shouldAnnounce(baseRecord({ ...due, status: 'paused' }), HOUR));
            assert.isFalse(ExtendedTestDueFlow.shouldAnnounce(baseRecord({ ...due, status: 'completed' }), HOUR));
            // Out of dice pool: the record is about to end, not ready to continue.
            assert.isFalse(ExtendedTestDueFlow.shouldAnnounce(baseRecord({ ...due, dicePool: 1, rollCount: 1 }), HOUR));
            // Without an interval nothing is ever due.
            assert.isFalse(ExtendedTestDueFlow.shouldAnnounce(baseRecord({ ...due, interval: { value: 0, unit: 'hours' } }), HOUR));
        });

        it('whispers only to users allowed to roll the record', () => {
            const record = baseRecord({
                permissions: { visibility: 'selectedUsers', visibleUsers: ['viewer'], editUsers: [], rollUsers: ['roller'] },
            });

            const recipients = ExtendedTestDueFlow.recipients(record);
            const canRoll = (id: string) => {
                const user = game.users?.get(id);
                return !!user && ExtendedTestRules.canRoll(record, user);
            };

            assert.isTrue(recipients.every(canRoll));
            // Every GM is allowed to roll, so a GM running this has to be among them.
            if (game.user?.isGM) assert.include(recipients, game.user.id);
        });
    });

    describe('Extended Test Flow', () => {
        it('registers a managed record from a first extended roll', async () => {
            const before = new Set(Object.keys(ExtendedTestStorage.getAll()));

            const test = TestCreator.fromPool({ pool: 20, threshold: 4 }, { showDialog: false, showMessage: false });
            test.data.extendedInterval = { value: 30, unit: 'minutes' };

            await test.execute();
            assert.isTrue(test.extended);

            // The globally registered hook listener persists the record asynchronously, poll for it.
            let newIds: string[] = [];
            for (let i = 0; i < 20 && !newIds.length; i++) {
                await new Promise(resolve => setTimeout(resolve, 100));
                newIds = Object.keys(ExtendedTestStorage.getAll()).filter(id => !before.has(id));
            }
            assert.lengthOf(newIds, 1);
            createdIds.push(...newIds);
            const record = ExtendedTestStorage.get(newIds[0])!;

            assert.strictEqual(record.threshold, 4);
            assert.strictEqual(record.interval.value, 30);
            assert.strictEqual(record.interval.unit, 'minutes');
            assert.isAtLeast(record.rollCount, 1);
            assert.isAtLeast(record.rolls.length, 1);
            assert.strictEqual(record.accumulatedHits, test.extendedHits.value);
        });

        it('rolls a managed record, accumulates hits and reduces the pool', async () => {
            const record = await createRecord({ dicePool: 20, threshold: 40 });

            const test = await ExtendedTestFlow.roll(record.id, { showDialog: false, showMessage: false });
            assert.isDefined(test);

            const updated = ExtendedTestStorage.get(record.id)!;
            assert.strictEqual(updated.rollCount, 1);
            assert.strictEqual(updated.rolls.length, 1);
            assert.strictEqual(updated.rolls[0].poolUsed, 20);
            assert.strictEqual(updated.accumulatedHits, updated.rolls[0].hits);
            // Cumulative -1: next roll uses 19 dice.
            assert.strictEqual(ExtendedTestRules.nextPool(updated), 19);

            const secondTest = await ExtendedTestFlow.roll(record.id, { showDialog: false, showMessage: false });
            assert.isDefined(secondTest);
            const secondUpdate = ExtendedTestStorage.get(record.id)!;
            assert.strictEqual(secondUpdate.rollCount, 2);
            assert.strictEqual(secondUpdate.rolls[1].poolUsed, 19);
            assert.strictEqual(
                secondUpdate.accumulatedHits,
                secondUpdate.rolls[0].hits + secondUpdate.rolls[1].hits
            );
        });

        it('completes the record when the threshold is reached', async () => {
            // Threshold 1 with pool 30 nearly guarantees completion; loop until terminal status.
            const record = await createRecord({ dicePool: 30, threshold: 1 });

            for (let i = 0; i < 40; i++) {
                const current = ExtendedTestStorage.get(record.id)!;
                if (current.status !== 'active') break;
                await ExtendedTestFlow.roll(record.id, { showDialog: false, showMessage: false });
            }

            const finished = ExtendedTestStorage.get(record.id)!;
            assert.include(['completed', 'failed'], finished.status);
            if (finished.status === 'completed') {
                assert.isAtLeast(finished.accumulatedHits, finished.threshold);
            }
        });

        it('fails the record when the pool is exhausted', async () => {
            const record = await createRecord({ dicePool: 1, threshold: 100 });

            // First roll uses the last die, second roll can't continue.
            await ExtendedTestFlow.roll(record.id, { showDialog: false, showMessage: false });
            let current = ExtendedTestStorage.get(record.id)!;

            if (current.status === 'active') {
                await ExtendedTestFlow.roll(record.id, { showDialog: false, showMessage: false });
                current = ExtendedTestStorage.get(record.id)!;
            }

            assert.strictEqual(current.status, 'failed');
        });

        it('handles pause, resume, complete and cancel transitions', async () => {
            const record = await createRecord();

            await ExtendedTestFlow.pause(record.id);
            assert.strictEqual(ExtendedTestStorage.get(record.id)!.status, 'paused');

            await ExtendedTestFlow.resume(record.id);
            assert.strictEqual(ExtendedTestStorage.get(record.id)!.status, 'active');

            await ExtendedTestFlow.complete(record.id);
            assert.strictEqual(ExtendedTestStorage.get(record.id)!.status, 'completed');

            await ExtendedTestFlow.cancel(record.id);
            assert.strictEqual(ExtendedTestStorage.get(record.id)!.status, 'cancelled');
        });

        it('brings an ended record back to active through reactivate', async () => {
            const record = await createRecord();

            await ExtendedTestFlow.cancel(record.id);
            assert.isTrue(ExtendedTestRules.isTerminal(ExtendedTestStorage.get(record.id)!));

            await ExtendedTestFlow.reactivate(record.id);
            assert.strictEqual(ExtendedTestStorage.get(record.id)!.status, 'active');

            // Only ended records reactivate; an active one is left alone.
            await ExtendedTestFlow.pause(record.id);
            await ExtendedTestFlow.reactivate(record.id);
            assert.strictEqual(ExtendedTestStorage.get(record.id)!.status, 'paused');
        });

        it('updates editable fields and logs the change', async () => {
            const record = await createRecord();

            await ExtendedTestFlow.update(record.id, { name: 'Renamed', threshold: 12 });
            const updated = ExtendedTestStorage.get(record.id)!;

            assert.strictEqual(updated.name, 'Renamed');
            assert.strictEqual(updated.threshold, 12);
            assert.isTrue(updated.log.some(entry => entry.action === 'update'));
        });

        it('applies a roll result onto the current record state', async () => {
            const record = await createRecord({ dicePool: 12, threshold: 40 });

            await ExtendedTestFlow._applyRollResult(record.id, {
                hits: 3, glitch: false, criticalGlitch: false, poolUsed: 12,
                timestamp: Date.now(), worldTime: game.time.worldTime, userId: game.user!.id!,
            }, undefined as never);

            const updated = ExtendedTestStorage.get(record.id)!;
            assert.strictEqual(updated.rollCount, 1);
            assert.strictEqual(updated.accumulatedHits, 3);
            assert.strictEqual(ExtendedTestRules.nextPool(updated), 11);
            assert.strictEqual(updated.status, 'active');
        });

        it('applies the cumulative modifier as a modifier, not into the pool base', async () => {
            const record = await createRecord({ dicePool: 12, threshold: 40 });
            record.rollCount = 2;

            const data = ExtendedTestFlow._prepareRollData(record)!;
            const change = data.pool.changes.find(entry => entry.name === 'SR5.ExtendedTest')!;

            assert.isDefined(change, 'the extended modifier is a change on the pool');
            assert.strictEqual(change.value, -2);
            // Base priority would fold it into the pool itself and hide it as its own line.
            assert.notStrictEqual(change.priority, Number.MIN_SAFE_INTEGER);
            assert.strictEqual(data.pool.base, 12);
            assert.strictEqual(data.pool.value, 10);

            // The first roll carries no modifier at all, rather than a zero valued one.
            record.rollCount = 0;
            const first = ExtendedTestFlow._prepareRollData(record)!;
            assert.isUndefined(first.pool.changes.find(entry => entry.name === 'SR5.ExtendedTest'));
            assert.strictEqual(first.pool.value, 12);
        });

        it('ends a record when a roll critically glitches', async () => {
            const record = await createRecord({ dicePool: 12, threshold: 40 });

            await ExtendedTestFlow._applyRollResult(record.id, {
                hits: 1, glitch: true, criticalGlitch: true, poolUsed: 12,
                timestamp: Date.now(), worldTime: game.time.worldTime, userId: game.user!.id!,
            }, undefined as never);

            assert.strictEqual(ExtendedTestStorage.get(record.id)!.status, 'failed');
        });
    });

    describe('World Time Flow', () => {
        // As the Time Control application hands them over, all zero based.
        const components = (month: number, dayOfMonth: number) =>
            ({ year: 2077, month, dayOfMonth, hour: 12, minute: 4, second: 17 });

        // 2077 is a non leap year in either numbering, so the offset can't skew these.
        it('resolves month and day of month into the day of the year', () => {
            assert.strictEqual(WorldTimeFlow.withDayOfYear(components(0, 0)).day, 0);
            assert.strictEqual(WorldTimeFlow.withDayOfYear(components(0, 11)).day, 11);
            // Days of January, then January and February, before the given month.
            assert.strictEqual(WorldTimeFlow.withDayOfYear(components(1, 0)).day, 31);
            assert.strictEqual(WorldTimeFlow.withDayOfYear(components(2, 0)).day, 59);

            const resolved = WorldTimeFlow.withDayOfYear(components(11, 11));
            assert.strictEqual(resolved.day, 345);

            // Kept, calendar modules may read those instead of the day of the year.
            assert.strictEqual(resolved.month, 11);
            assert.strictEqual(resolved.dayOfMonth, 11);
        });

        it('round trips an absolute date through world time', () => {
            const time = WorldTimeFlow.componentsToTime(components(11, 11));
            const parsed = game.time.calendar.timeToComponents(time);

            // Raw components carry the epoch year, not the calendar year.
            assert.strictEqual(parsed.year, 2077 - WorldTimeFlow.yearZero);
            assert.strictEqual(parsed.month, 11);
            assert.strictEqual(parsed.dayOfMonth, 11);
            assert.strictEqual(parsed.hour, 12);
            assert.strictEqual(parsed.minute, 4);
            assert.strictEqual(parsed.second, 17);
        });

        it('keeps components without a month untouched', () => {
            // Interval shifts pass plain seconds and never carry a month.
            const shift = { day: 3, hour: 2 };
            assert.deepEqual(WorldTimeFlow.withDayOfYear(shift), shift);
        });

        it('resolves the start date into the configured Shadowrun era', () => {
            const worldTime = WorldTimeFlow.componentsToTime(SR.time.START_DATE);
            const shown = WorldTimeFlow.components(worldTime);

            assert.strictEqual(shown.year, 2075);
            assert.strictEqual(shown.month, 0);
            assert.strictEqual(shown.dayOfMonth, 0);
            assert.strictEqual(WorldTimeFlow.format(worldTime), '2075-01-01 00:00:00');
        });

        // The guard that keeps a running campaign from being reset to the start date.
        it('leaves an already initialized world time alone', async () => {
            const before = game.time.worldTime;
            assert.isTrue(game.settings.get(SYSTEM_NAME, FLAGS.WorldTimeInitialized));

            await WorldTimeFlow.initialize();

            assert.strictEqual(game.time.worldTime, before);
        });

        it('reports years in the numbering of the world calendar', () => {
            const yearZero = WorldTimeFlow.yearZero;
            const raw = game.time.calendar.timeToComponents(game.time.worldTime);

            assert.strictEqual(WorldTimeFlow.components().year, raw.year + yearZero);
        });

        it('round trips a displayed year back to the same world time', () => {
            const worldTime = WorldTimeFlow.componentsToTime(components(11, 11));
            const shown = WorldTimeFlow.components(worldTime);

            assert.strictEqual(shown.year, 2077);
            assert.strictEqual(shown.month, 11);
            assert.strictEqual(shown.dayOfMonth, 11);
            assert.strictEqual(WorldTimeFlow.format(worldTime), '2077-12-12 12:04:17');
        });
    });

    describe('SuccessTest extended interval integration', () => {
        it('marks a test as extended through the interval field', () => {
            const test = TestCreator.fromPool({ pool: 5 }, { showDialog: false, showMessage: false });
            assert.deepEqual(test.data.extendedInterval, { value: 0, unit: 'minutes' });
            assert.isFalse(test.extended);

            test.data.extendedInterval = { value: 1, unit: 'hours' };
            assert.isTrue(test.extended);
        });

        it('opts out of extending when the interval is zeroed', () => {
            const test = TestCreator.fromPool({ pool: 5 }, { showDialog: false, showMessage: false });

            // An action derived test arrives marked extended with a default interval.
            test.data.extended = true;
            test.data.extendedInterval = { value: 1, unit: 'minutes' };
            assert.isTrue(test.extended);

            // Zeroing the interval in the dialog turns it back into a normal test.
            test.data.extendedInterval = { value: 0, unit: 'minutes' };
            assert.isFalse(test.extended);

            // Legacy messages from before the interval existed still extend.
            test.data.extendedRoll = true;
            assert.isTrue(test.extended);
        });

        it('takes the interval from the action it was created with', async () => {
            const actor = await factory.createActor({ type: 'character' });
            const item = await factory.createItem({
                type: 'action',
                system: { action: { test: 'SuccessTest', attribute: 'body', extended: { value: 1, unit: 'hours' } } },
            });

            const test = await TestCreator.fromItem(item, actor, { showDialog: false, showMessage: false });

            assert.isTrue(test?.data.extended);
            assert.deepEqual(test?.data.extendedInterval, { value: 1, unit: 'hours' });
            assert.isTrue(test?.extended);
        });

        it('stays a normal test for an action without an interval', async () => {
            const actor = await factory.createActor({ type: 'character' });
            const item = await factory.createItem({
                type: 'action',
                system: { action: { test: 'SuccessTest', attribute: 'body' } },
            });

            const test = await TestCreator.fromItem(item, actor, { showDialog: false, showMessage: false });

            assert.isFalse(test?.data.extended);
            assert.strictEqual(test?.data.extendedInterval.value, 0);
            assert.isFalse(test?.extended);
        });
    });
};
