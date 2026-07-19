import { QuenchBatchContext } from "@ethaks/fvtt-quench";
import { ExtendedTestFlow } from "@/module/flows/ExtendedTestFlow";
import { ExtendedTestRules } from "@/module/rules/ExtendedTestRules";
import { ExtendedTestStorage } from "@/module/storage/ExtendedTestStorage";
import { intervalToSeconds } from "@/module/utils/timeUnits";
import { ExtendedTestRecord } from "@/module/types/flows/ExtendedTest";
import { TestCreator } from "@/module/tests/TestCreator";
import { SR } from "@/module/constants";

export const shadowrunExtendedTests = (context: QuenchBatchContext) => {
    const { describe, it, afterEach } = context;
    const assert: Chai.AssertStatic = context.assert;

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
        const baseRecord = (overrides: Partial<ExtendedTestRecord> = {}): ExtendedTestRecord => ({
            id: 'test',
            name: 'Test',
            description: '',
            notes: '',
            creatorUserId: 'creator',
            testType: 'SuccessTest',
            dicePool: 10,
            currentPool: 10,
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
            updatedWorldTime: 0,
            rolls: [],
            log: [],
            ...overrides,
        });

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

            const test = await ExtendedTestFlow.roll(record.id);
            assert.isDefined(test);

            const updated = ExtendedTestStorage.get(record.id)!;
            assert.strictEqual(updated.rollCount, 1);
            assert.strictEqual(updated.rolls.length, 1);
            assert.strictEqual(updated.rolls[0].poolUsed, 20);
            assert.strictEqual(updated.accumulatedHits, updated.rolls[0].hits);
            // Cumulative -1: next roll uses 19 dice.
            assert.strictEqual(updated.currentPool, 19);

            const secondTest = await ExtendedTestFlow.roll(record.id);
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
                await ExtendedTestFlow.roll(record.id);
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
            await ExtendedTestFlow.roll(record.id);
            let current = ExtendedTestStorage.get(record.id)!;

            if (current.status === 'active') {
                await ExtendedTestFlow.roll(record.id);
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

        it('updates editable fields and logs the change', async () => {
            const record = await createRecord();

            await ExtendedTestFlow.update(record.id, { name: 'Renamed', threshold: 12 });
            const updated = ExtendedTestStorage.get(record.id)!;

            assert.strictEqual(updated.name, 'Renamed');
            assert.strictEqual(updated.threshold, 12);
            assert.isTrue(updated.log.some(entry => entry.action === 'update'));
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
    });
};
