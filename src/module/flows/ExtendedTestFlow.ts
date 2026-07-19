import { FLAGS } from "../constants";
import { SocketMessage } from "../sockets";
import { SR5Actor } from "../actor/SR5Actor";
import { TestRules } from "../rules/TestRules";
import { DataDefaults } from "../data/DataDefaults";
import { ModifiableValue } from "../mods/ModifiableValue";
import { ExtendedTestRules } from "../rules/ExtendedTestRules";
import { intervalToSeconds } from "../utils/timeUnits";
import { ExtendedTestStorage } from "../storage/ExtendedTestStorage";
import { SuccessTest, SuccessTestData } from "../tests/SuccessTest";
import { TestCreator } from "../tests/TestCreator";
import {
    ExtendedTestInterval,
    ExtendedTestLogEntry,
    ExtendedTestPermissions,
    ExtendedTestRecord,
    ExtendedTestStatus,
} from "../types/flows/ExtendedTest";

/**
 * Parameters for creating a managed extended test manually from the manager application.
 */
export interface ExtendedTestCreateParams {
    name: string;
    description?: string;
    notes?: string;
    actorUuid?: string;
    dicePool: number;
    threshold: number;
    interval: ExtendedTestInterval;
    cumulativeModifier?: boolean;
    advanceTimeOnRoll?: boolean;
    permissions?: Partial<ExtendedTestPermissions>;
}

/**
 * Orchestrate managed extended tests. SR5#48.
 *
 * Records live in the global data storage (see ExtendedTestStorage) and each roll
 * runs through the full SuccessTest pipeline, producing a normal test chat message.
 */
export const ExtendedTestFlow = {
    /**
     * Default permissions for newly created records.
     */
    _defaultPermissions(overrides: Partial<ExtendedTestPermissions> = {}): ExtendedTestPermissions {
        return {
            visibility: 'gmAndOwner',
            visibleUsers: [],
            editUsers: [],
            rollUsers: [],
            ...overrides,
        };
    },

    /**
     * Create a log entry for the current user and time.
     */
    _logEntry(action: ExtendedTestLogEntry['action'], detail?: string): ExtendedTestLogEntry {
        return {
            timestamp: Date.now(),
            worldTime: game.time.worldTime,
            userId: game.user?.id ?? '',
            action,
            detail,
        };
    },

    /**
     * Apply update timestamps and persist the record.
     */
    async _persist(record: ExtendedTestRecord) {
        record.updatedAt = Date.now();
        record.updatedWorldTime = game.time.worldTime;
        await ExtendedTestStorage.setRecord(record);
    },

    /**
     * Manually create a managed extended test from the manager application.
     */
    async create(params: ExtendedTestCreateParams): Promise<ExtendedTestRecord> {
        const now = Date.now();
        const worldTime = game.time.worldTime;

        const record: ExtendedTestRecord = {
            id: foundry.utils.randomID(),
            name: params.name || game.i18n.localize('SR5.ExtendedTestManager.NewTest'),
            description: params.description ?? '',
            notes: params.notes ?? '',
            actorUuid: params.actorUuid || undefined,
            creatorUserId: game.user?.id ?? '',

            testType: 'SuccessTest',
            testData: undefined,

            dicePool: Math.max(params.dicePool, 0),
            currentPool: Math.max(params.dicePool, 0),
            cumulativeModifier: params.cumulativeModifier ?? true,
            threshold: Math.max(params.threshold, 0),
            accumulatedHits: 0,
            rollCount: 0,

            interval: params.interval,
            advanceTimeOnRoll: params.advanceTimeOnRoll ?? false,

            status: 'active',
            permissions: ExtendedTestFlow._defaultPermissions(params.permissions),

            createdAt: now,
            createdWorldTime: worldTime,
            updatedAt: now,
            updatedWorldTime: worldTime,

            rolls: [],
            log: [ExtendedTestFlow._logEntry('create')],
        };

        await ExtendedTestStorage.setRecord(record);
        return record;
    },

    /**
     * Handle any completed SuccessTest. Registered on the sr5_afterTestComplete hook.
     *
     * First rolls of a new extended test (interval set within the test dialog) register
     * a new record. Managed rolls record their results directly within roll() instead,
     * as hook listeners can't be awaited.
     */
    async handleTestComplete(test: SuccessTest) {
        try {
            if (test.data.extendedManagedId) return;
            if (test.extended && !test.data.extendedRoll) {
                await ExtendedTestFlow.registerFromTest(test);
            }
        } catch (error) {
            console.error('Shadowrun 5e | Failed to process extended test result', error, test);
        }
    },

    /**
     * Register a new managed extended test from the first roll of an extended test.
     */
    async registerFromTest(test: SuccessTest): Promise<ExtendedTestRecord | undefined> {
        if (!test.evaluated) return;

        const now = Date.now();
        const worldTime = game.time.worldTime;

        const actor = test.actor;
        const title = game.i18n.localize(test.data.title as Parameters<typeof game.i18n.localize>[0]);
        const name = actor ? `${title} (${actor.name})` : title;

        const record: ExtendedTestRecord = {
            id: foundry.utils.randomID(),
            name,
            description: '',
            notes: '',
            actorUuid: test.data.sourceActorUuid,
            creatorUserId: game.user?.id ?? '',

            testType: test.data.type ?? 'SuccessTest',
            testData: foundry.utils.deepClone(test.data),

            // Use the pool without the cumulative modifier as a starting value.
            dicePool: test.pool.value,
            currentPool: test.pool.value,
            cumulativeModifier: true,
            threshold: test.threshold.value,
            accumulatedHits: test.extendedHits.value,
            rollCount: 1,

            interval: test.data.extendedInterval ?? { value: 0, unit: 'minutes' },
            advanceTimeOnRoll: false,

            status: 'active',
            permissions: ExtendedTestFlow._defaultPermissions(),

            createdAt: now,
            createdWorldTime: worldTime,
            updatedAt: now,
            updatedWorldTime: worldTime,
            lastRollWorldTime: worldTime,

            rolls: [ExtendedTestFlow._rollEntry(test)],
            log: [ExtendedTestFlow._logEntry('create'), ExtendedTestFlow._logEntry('roll')],
        };

        record.currentPool = ExtendedTestRules.nextPool(record);
        ExtendedTestFlow._applyStatusTransitions(record);

        await ExtendedTestStorage.setRecord(record);
        ui.notifications?.info(game.i18n.format('SR5.ExtendedTestManager.Notifications.Registered', { name: record.name }));
        return record;
    },

    /**
     * Create a roll history entry from an evaluated test.
     */
    _rollEntry(test: SuccessTest) {
        return {
            hits: test.hits.value,
            glitch: test.glitched,
            criticalGlitch: test.criticalGlitched,
            poolUsed: test.pool.value,
            timestamp: Date.now(),
            worldTime: game.time.worldTime,
            messageUuid: test.data.messageUuid,
            userId: game.user?.id ?? '',
        };
    },

    /**
     * Transition a record to completed / failed based on its current values.
     */
    _applyStatusTransitions(record: ExtendedTestRecord) {
        if (record.status !== 'active') return;

        if (ExtendedTestRules.isComplete(record)) {
            record.status = 'completed';
            record.log.push(ExtendedTestFlow._logEntry('complete'));
        } else if (!ExtendedTestRules.canContinue(record)) {
            record.status = 'failed';
            record.log.push(ExtendedTestFlow._logEntry('fail'));
        }
    },

    /**
     * Roll the next iteration of a managed extended test through the full test pipeline.
     */
    async roll(id: string): Promise<SuccessTest | undefined> {
        const record = ExtendedTestStorage.get(id);
        if (!record || !game.user) return;

        if (record.status !== 'active' || !ExtendedTestRules.canRoll(record, game.user)) {
            ui.notifications?.warn('SR5.ExtendedTestManager.Notifications.NoRollPermission', { localize: true });
            return;
        }

        if (!ExtendedTestRules.canContinue(record)) {
            record.log.push(ExtendedTestFlow._logEntry('fail'));
            record.status = 'failed';
            await ExtendedTestFlow._persist(record);
            ui.notifications?.warn('SR5.Warnings.CantExtendTestFurther', { localize: true });
            return;
        }

        const data = ExtendedTestFlow._prepareRollData(record);
        if (!data) return;

        const testCls = TestCreator._getTestClass(data.type);
        if (!testCls) {
            console.error(`Shadowrun 5e | Unknown test type ${data.type} for extended test ${record.id}`);
            return;
        }

        const actor = record.actorUuid ? await fromUuid(record.actorUuid) : undefined;
        const documents = actor instanceof SR5Actor ? { actor } : undefined;

        const test = new testCls(data, documents, { showDialog: true, showMessage: true });

        // Remove any previous edge usage.
        test.data.pushTheLimit = false;
        test.applyPushTheLimit();
        test.data.secondChance = false;
        test.applySecondChance();

        // Permission was already checked against the record.
        test.allowUserExecute();

        await test.execute();

        // Rolls can be canceled or fail before evaluation, only record real results.
        if (test.evaluated) await ExtendedTestFlow.recordRollResult(test);

        return test;
    },

    /**
     * Prepare test data for the next managed roll based on the record state.
     */
    _prepareRollData(record: ExtendedTestRecord): SuccessTestData | undefined {
        // Rebuild from the last roll snapshot or from scratch for manually created records.
        const data = record.testData
            ? foundry.utils.deepClone(record.testData)
            : SuccessTest.applyStructuralDefaults({} as Partial<SuccessTestData>);

        data.type ??= record.testType;
        data.evaluated = false;
        data.extended = true;
        data.extendedRoll = true;
        data.extendedManagedId = record.id;
        // Managed rolls have their own record, don't inherit the message of previous rolls.
        data.messageUuid = undefined;

        if (!record.testData) {
            data.title = record.name;
            data.pool.base = record.dicePool;
        }
        data.threshold.base = record.threshold;

        // Apply the cumulative dice pool modifier for this iteration.
        const pool = new ModifiableValue(data.pool);
        if (record.cumulativeModifier) {
            pool.addUniqueBase('SR5.ExtendedTest', TestRules.extendedModifierValue * record.rollCount);
        } else {
            pool.remove('SR5.ExtendedTest');
        }
        pool.calcTotal({ min: 0 });

        // Seed accumulated hits from the record, keeping it the source of truth.
        data.values.extendedHits = DataDefaults.createData('value_field', { label: 'SR5.ExtendedHits' });
        if (record.accumulatedHits > 0) {
            ModifiableValue.addBase(data.values.extendedHits, 'SR5.Hits', record.accumulatedHits);
        }
        ModifiableValue.calcTotal(data.values.extendedHits, { min: 0 });

        return data;
    },

    /**
     * Store the result of a managed roll back onto its record.
     */
    async recordRollResult(test: SuccessTest) {
        const id = test.data.extendedManagedId;
        if (!id) return;

        const record = ExtendedTestStorage.get(id);
        if (!record) return;

        record.rolls.push(ExtendedTestFlow._rollEntry(test));
        record.log.push(ExtendedTestFlow._logEntry('roll'));
        record.accumulatedHits += test.hits.value;
        record.rollCount += 1;
        record.lastRollWorldTime = game.time.worldTime;

        // Keep the snapshot current, so following rolls include actor / effect changes.
        record.testData = foundry.utils.deepClone(test.data);
        record.currentPool = ExtendedTestRules.nextPool(record);

        ExtendedTestFlow._applyStatusTransitions(record);

        await ExtendedTestFlow._persist(record);

        if (record.advanceTimeOnRoll) {
            await ExtendedTestFlow._advanceTime(record);
        }

        if (record.status === 'completed') {
            ui.notifications?.info(game.i18n.format('SR5.ExtendedTestManager.Notifications.Completed', { name: record.name }));
        } else if (record.status === 'failed') {
            ui.notifications?.warn(game.i18n.format('SR5.ExtendedTestManager.Notifications.Failed', { name: record.name }));
        }
    },

    /**
     * Advance world time by the record interval, delegating to a GM when needed.
     */
    async _advanceTime(record: ExtendedTestRecord) {
        const seconds = intervalToSeconds(record.interval);
        if (seconds <= 0) return;

        if (game.user?.isGM) {
            await game.time.advance(seconds);
        } else {
            SocketMessage.emitForGM(FLAGS.AdvanceWorldTime, { id: record.id });
        }
    },

    /**
     * Handle a player request to advance world time for an extended test roll.
     *
     * Re-validates against the stored record instead of trusting the message payload.
     */
    async _handleAdvanceWorldTimeSocketMessage(message: Shadowrun.SocketMessageData) {
        if (!game.user?.isGM) return;

        const record = ExtendedTestStorage.get(message.data.id);
        if (!record || !record.advanceTimeOnRoll) return;

        const seconds = intervalToSeconds(record.interval);
        if (seconds <= 0) return;

        await game.time.advance(seconds);
    },

    /**
     * Change a record status after checking edit permission.
     */
    async _setStatus(id: string, status: ExtendedTestStatus, action: ExtendedTestLogEntry['action']) {
        const record = ExtendedTestStorage.get(id);
        if (!record || !game.user) return;

        if (!ExtendedTestRules.canEdit(record, game.user)) {
            ui.notifications?.warn('SR5.ExtendedTestManager.Notifications.NoEditPermission', { localize: true });
            return;
        }

        record.status = status;
        record.log.push(ExtendedTestFlow._logEntry(action));
        await ExtendedTestFlow._persist(record);
    },

    async pause(id: string) {
        const record = ExtendedTestStorage.get(id);
        if (record?.status !== 'active') return;
        await ExtendedTestFlow._setStatus(id, 'paused', 'pause');
    },

    async resume(id: string) {
        const record = ExtendedTestStorage.get(id);
        if (record?.status !== 'paused') return;
        await ExtendedTestFlow._setStatus(id, 'active', 'resume');
    },

    async complete(id: string) {
        await ExtendedTestFlow._setStatus(id, 'completed', 'complete');
    },

    async cancel(id: string) {
        await ExtendedTestFlow._setStatus(id, 'cancelled', 'cancel');
    },

    /**
     * Update editable fields of a record after checking edit permission.
     */
    async update(id: string, changes: Partial<ExtendedTestRecord>) {
        const record = ExtendedTestStorage.get(id);
        if (!record || !game.user) return;

        if (!ExtendedTestRules.canEdit(record, game.user)) {
            ui.notifications?.warn('SR5.ExtendedTestManager.Notifications.NoEditPermission', { localize: true });
            return;
        }

        // Only allow updating user editable fields.
        const editableKeys = [
            'name', 'description', 'notes', 'actorUuid', 'dicePool', 'threshold',
            'interval', 'cumulativeModifier', 'advanceTimeOnRoll', 'permissions',
        ] as const;

        const applied: string[] = [];
        for (const key of editableKeys) {
            if (!(key in changes)) continue;
            (record as any)[key] = changes[key];
            applied.push(key);
        }
        if (!applied.length) return;

        record.currentPool = ExtendedTestRules.nextPool(record);
        record.log.push(ExtendedTestFlow._logEntry('update', applied.join(', ')));
        await ExtendedTestFlow._persist(record);
    },

    /**
     * Delete a record after checking delete permission.
     */
    async remove(id: string) {
        const record = ExtendedTestStorage.get(id);
        if (!record || !game.user) return;

        if (!ExtendedTestRules.canDelete(record, game.user)) {
            ui.notifications?.warn('SR5.ExtendedTestManager.Notifications.NoEditPermission', { localize: true });
            return;
        }

        await ExtendedTestStorage.delete(id);
    },
}
