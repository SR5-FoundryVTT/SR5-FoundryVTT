import { FLAGS, SYSTEM_NAME } from "../constants";
import { SocketMessage } from "../sockets";
import { SR5Actor } from "../actor/SR5Actor";
import { TestRules } from "../rules/TestRules";
import { DataDefaults } from "../data/DataDefaults";
import { ModifiableValue } from "../mods/ModifiableValue";
import { ExtendedTestRules } from "../rules/ExtendedTestRules";
import { ExtendedTestDueFlow } from "./ExtendedTestDueFlow";
import { intervalToSeconds } from "../utils/timeUnits";
import { ExtendedTestStorage } from "../storage/ExtendedTestStorage";
import { SuccessTest, SuccessTestData, TestOptions } from "../tests/SuccessTest";
import { TestCreator } from "../tests/TestCreator";
import {
    ExtendedTestInterval,
    ExtendedTestLogEntry,
    ExtendedTestPermissions,
    ExtendedTestRecord,
    ExtendedTestRollEntry,
    ExtendedTestStatus,
} from "../types/flows/ExtendedTest";

/**
 * Parameters for creating a managed extended test manually from the manager application.
 */
export interface ExtendedTestCreateParams {
    name: string;
    notes?: string;
    actorUuid?: string;
    dicePool: number;
    threshold: number;
    interval: ExtendedTestInterval;
    cumulativeModifier?: boolean;
    advanceTimeOnRoll?: boolean;
    permissions?: Partial<ExtendedTestPermissions>;
}

// Records currently being rolled on this client, to keep a double click from rolling twice.
const rollsInFlight = new Set<string>();

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
            notes: params.notes ?? '',
            actorUuid: params.actorUuid || undefined,
            creatorUserId: game.user?.id ?? '',

            testType: 'SuccessTest',
            testData: undefined,

            dicePool: Math.max(params.dicePool, 0),
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
            notes: '',
            actorUuid: test.data.sourceActorUuid,
            creatorUserId: game.user?.id ?? '',

            testType: test.data.type ?? 'SuccessTest',
            testData: foundry.utils.deepClone(test.data),

            // Use the pool without the cumulative modifier as a starting value.
            dicePool: test.pool.value,
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
            lastRollWorldTime: worldTime,

            rolls: [ExtendedTestFlow._rollEntry(test)],
            log: [ExtendedTestFlow._logEntry('create'), ExtendedTestFlow._logEntry('roll')],
        };

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
     * Transition a record to completed / failed based on its current values. SR5#48.
     */
    _applyStatusTransitions(record: ExtendedTestRecord) {
        if (record.status !== 'active') return;

        // A critical glitch ends the test, whatever pool or progress is left.
        if (ExtendedTestRules.isCriticalGlitchEnd(record)) {
            record.status = 'failed';
            record.log.push(ExtendedTestFlow._logEntry('fail', 'criticalGlitch'));
            return;
        }

        // Reaching the threshold is the only thing that ends a test on its own.
        if (ExtendedTestRules.isComplete(record)) {
            record.status = 'completed';
            record.log.push(ExtendedTestFlow._logEntry('complete'));
        }
    },

    /**
     * Roll the next iteration of a managed extended test through the full test pipeline.
     */
    async roll(id: string, options: Partial<TestOptions> = {}): Promise<SuccessTest | undefined> {
        const record = ExtendedTestStorage.get(id);
        if (!record || !game.user) return;

        if (!ExtendedTestRules.canRoll(record, game.user)) {
            ui.notifications?.warn('SR5.ExtendedTestManager.Notifications.NoRollPermission', { localize: true });
            return;
        }

        // A paused or ended record isn't a permission problem, say so separately.
        if (record.status !== 'active') {
            ui.notifications?.warn('SR5.ExtendedTestManager.Notifications.NotActive', { localize: true });
            return;
        }

        if (rollsInFlight.has(id)) return;

        if (!ExtendedTestRules.canContinue(record)) {
            ExtendedTestFlow._applyStatusTransitions(record);
            await ExtendedTestFlow._persist(record);
            ui.notifications?.warn('SR5.Warnings.CantExtendTestFurther', { localize: true });
            return;
        }

        if (!ExtendedTestFlow._intervalAllowsRoll(record)) {
            ui.notifications?.warn('SR5.ExtendedTestManager.Notifications.NotDue', { localize: true });
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

        const test = new testCls(data, documents, { showDialog: true, showMessage: true, ...options });

        // Remove any previous edge usage.
        test.data.pushTheLimit = false;
        test.applyPushTheLimit();
        test.data.secondChance = false;
        test.applySecondChance();

        // Permission was already checked against the record.
        test.allowUserExecute();

        rollsInFlight.add(id);
        try {
            await test.execute();

            // Rolls can be canceled or fail before evaluation, only record real results.
            if (test.evaluated) await ExtendedTestFlow.recordRollResult(test);
        } finally {
            rollsInFlight.delete(id);
        }

        return test;
    },

    /**
     * Check elapsed game time against the record interval, when enforcement is active.
     */
    _intervalAllowsRoll(record: ExtendedTestRecord): boolean {
        const enforce = game.settings.get(SYSTEM_NAME, FLAGS.EnforceExtendedTestInterval) as boolean;
        if (!enforce) return true;
        return ExtendedTestRules.intervalAllowsRoll(record, game.time.worldTime);
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

        // One die less per roll already made, as a situational modifier instead of pool base.
        // A zero value removes the change, so the first roll shows no modifier at all.
        const priorRolls = record.cumulativeModifier ? record.rollCount : 0;
        const pool = new ModifiableValue(data.pool);
        pool.setUnique('SR5.ExtendedTest', TestRules.extendedModifierValue * priorRolls);
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
     *
     * DataStorage doesn't await the GM write, so a player applying this locally would
     * read-modify-write a stale record. Hand it to a GM instead.
     */
    async recordRollResult(test: SuccessTest) {
        const id = test.data.extendedManagedId;
        if (!id) return;

        const rollEntry = ExtendedTestFlow._rollEntry(test);
        const testData = foundry.utils.deepClone(test.data);

        if (game.user?.isGM) {
            await ExtendedTestFlow._applyRollResult(id, rollEntry, testData);
            return;
        }

        SocketMessage.emitForGM(FLAGS.ApplyExtendedTestRoll, { id, rollEntry, testData });
    },

    /**
     * Apply a roll result onto its record and advance world time, as the GM.
     *
     * Reads the record fresh and mutates in one pass, so concurrent rolls can't lose hits.
     */
    async _applyRollResult(id: string, rollEntry: ExtendedTestRollEntry, testData: SuccessTestData) {
        const record = ExtendedTestStorage.get(id);
        if (!record) return;

        record.rolls.push(rollEntry);
        record.log.push({ ...ExtendedTestFlow._logEntry('roll'), userId: rollEntry.userId });
        record.accumulatedHits += rollEntry.hits;
        record.rollCount += 1;
        record.lastRollWorldTime = rollEntry.worldTime;

        // Keep the snapshot current, so following rolls include actor / effect changes.
        record.testData = testData;

        ExtendedTestFlow._applyStatusTransitions(record);

        await ExtendedTestFlow._persist(record);

        if (record.advanceTimeOnRoll) {
            const seconds = intervalToSeconds(record.interval);
            if (seconds > 0) await game.time.advance(seconds);
        }

        ExtendedTestFlow._notifyStatus(record);
    },

    /**
     * Notify about a record having reached a terminal status.
     */
    _notifyStatus(record: ExtendedTestRecord) {
        if (record.status === 'completed') {
            ui.notifications?.info(game.i18n.format('SR5.ExtendedTestManager.Notifications.Completed', { name: record.name }));
        } else if (record.status === 'failed') {
            ui.notifications?.warn(game.i18n.format('SR5.ExtendedTestManager.Notifications.Failed', { name: record.name }));
        }
    },

    /**
     * Handle a player roll result, applying it as GM.
     */
    async _handleApplyRollSocketMessage(message: Shadowrun.SocketMessageData) {
        if (!game.user?.isGM) return;

        const { id, rollEntry, testData } = message.data as {
            id: string;
            rollEntry: ExtendedTestRollEntry;
            testData: SuccessTestData;
        };
        if (!id || !rollEntry) return;

        await ExtendedTestFlow._applyRollResult(id, rollEntry, testData);
    },

    /**
     * Change a record status after checking permission.
     *
     * Pausing is a scheduling matter and stays with editors. Ending a test, or bringing an
     * ended one back, changes its outcome and stays with the GM or creator.
     */
    async _setStatus(id: string, status: ExtendedTestStatus, action: ExtendedTestLogEntry['action'], requireManage = false) {
        const record = ExtendedTestStorage.get(id);
        if (!record || !game.user) return;

        const allowed = requireManage
            ? ExtendedTestRules.canManage(record, game.user)
            : ExtendedTestRules.canEdit(record, game.user);
        if (!allowed) {
            ui.notifications?.warn('SR5.ExtendedTestManager.Notifications.NoEditPermission', { localize: true });
            return;
        }

        record.status = status;
        record.log.push(ExtendedTestFlow._logEntry(action));
        await ExtendedTestFlow._persist(record);

        // A record resumed while already overdue would otherwise wait for the next world
        // time change to announce itself.
        if (status === 'active') await ExtendedTestDueFlow.announceDue();
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
        await ExtendedTestFlow._setStatus(id, 'completed', 'complete', true);
    },

    async cancel(id: string) {
        await ExtendedTestFlow._setStatus(id, 'cancelled', 'cancel', true);
    },

    /**
     * Bring an ended record back to active, so a misclick or a GM ruling isn't final.
     */
    async reactivate(id: string) {
        const record = ExtendedTestStorage.get(id);
        if (!record || !ExtendedTestRules.isTerminal(record)) return;
        await ExtendedTestFlow._setStatus(id, 'active', 'resume', true);
    },

    /**
     * Deep compare two record values. Everything a record holds is plain JSON data, but
     * both foundry.utils.equals and diffObject fall back to a reference compare for arrays,
     * which the rebuilt user permission lists would always fail.
     */
    _valuesEqual(a: unknown, b: unknown): boolean {
        if (a === b) return true;
        if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') return false;

        if (Array.isArray(a) || Array.isArray(b)) {
            if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
            return a.every((entry, index) => ExtendedTestFlow._valuesEqual(entry, b[index]));
        }

        const left = a as Record<string, unknown>;
        const right = b as Record<string, unknown>;
        const keys = Object.keys(left);
        if (keys.length !== Object.keys(right).length) return false;
        return keys.every(key => key in right && ExtendedTestFlow._valuesEqual(left[key], right[key]));
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

        const editableKeys = ['name', 'notes'] as const;
        // How hard the test is and who may take part stays with the owner.
        const managedKeys = [
            'actorUuid', 'dicePool', 'accumulatedHits', 'threshold', 'interval',
            'cumulativeModifier', 'advanceTimeOnRoll', 'permissions',
        ] as const;

        const canManage = ExtendedTestRules.canManage(record, game.user);
        const allowedKeys = canManage ? [...editableKeys, ...managedKeys] : editableKeys;

        // The config dialog always submits every field it renders, so compare before applying.
        // Otherwise a single corrected value logs the whole form as changed.
        const applied: string[] = [];
        for (const key of allowedKeys) {
            if (!(key in changes)) continue;
            if (ExtendedTestFlow._valuesEqual(record[key], changes[key])) continue;
            record[key as string] = changes[key];
            applied.push(key);
        }
        if (!applied.length) return;

        // Correcting hits or threshold can reach the goal on its own. Only completion is
        // applied here: the failure paths belong to a roll, and a reactivated record would
        // otherwise fall straight back into the critical glitch that ended it.
        if (record.status === 'active' && ExtendedTestRules.isComplete(record)) {
            record.status = 'completed';
            record.log.push(ExtendedTestFlow._logEntry('complete'));
            ExtendedTestFlow._notifyStatus(record);
        }

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
