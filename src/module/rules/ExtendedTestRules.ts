import { TestRules } from "./TestRules";
import { intervalToSeconds } from "../utils/timeUnits";
import { ExtendedTestRecord } from "../types/flows/ExtendedTest";
import { ModifiableValue } from "../mods/ModifiableValue";
import { SR5Actor } from "../actor/SR5Actor";

/**
 * Rules and permission handling around managed extended tests.
 *
 * All functions are pure over the given record / user, so they can be unit tested.
 * See SR5#48 'Extended Tests'.
 */
export const ExtendedTestRules = {
    /**
     * The manager stores the source threshold; a registered test's snapshot retains the
     * modifiers that determine the threshold actually required to complete it.
     */
    threshold: (record: ExtendedTestRecord): number => {
        const threshold = record.testData?.threshold;
        if (!threshold) return record.threshold;

        const value = foundry.utils.deepClone(threshold);
        value.base = record.threshold;
        return ModifiableValue.calcTotal(value, { min: 0 });
    },

    /**
     * Determine if the given user owns the actor associated with the record.
     */
    isActorOwner: (record: ExtendedTestRecord, user: User): boolean => {
        if (!record.actorUuid) return false;
        const actor = fromUuidSync(record.actorUuid);
        if (!(actor instanceof SR5Actor)) return false;
        return actor.testUserPermission(user, 'OWNER');
    },

    /**
     * Determine if the given user is the creator of the record.
     */
    isCreator: (record: ExtendedTestRecord, user: User): boolean => {
        return record.creatorUserId === user.id;
    },

    /**
     * Can the given user see this record?
     */
    canView: (record: ExtendedTestRecord, user: User): boolean => {
        if (user.isGM) return true;
        if (ExtendedTestRules.isCreator(record, user)) return true;

        switch (record.permissions.visibility) {
            case 'public':
                return true;
            case 'gmAndOwner':
                return ExtendedTestRules.isActorOwner(record, user);
            case 'selectedUsers':
                return record.permissions.visibleUsers.includes(user.id!);
            case 'gmOnly':
                return false;
        }
        return false;
    },

    /**
     * Can the given user edit this record?
     */
    canEdit: (record: ExtendedTestRecord, user: User): boolean => {
        if (!ExtendedTestRules.canView(record, user)) return false;
        if (user.isGM) return true;
        if (ExtendedTestRules.isCreator(record, user)) return true;
        return record.permissions.editUsers.includes(user.id!);
    },

    /**
     * Can the given user roll this record?
     *
     * NOTE: This ignores record status. Check canContinue / status separately.
     */
    canRoll: (record: ExtendedTestRecord, user: User): boolean => {
        if (!ExtendedTestRules.canView(record, user)) return false;
        if (user.isGM) return true;
        if (ExtendedTestRules.isCreator(record, user)) return true;
        if (ExtendedTestRules.isActorOwner(record, user)) return true;
        return record.permissions.rollUsers.includes(user.id!);
    },

    /**
     * Can the given user change the rules of this record, or who may take part in it?
     *
     * Limited to GM and creator, so granting edit permission can't be escalated.
     */
    canManage: (record: ExtendedTestRecord, user: User): boolean => {
        return user.isGM || ExtendedTestRules.isCreator(record, user);
    },

    /**
     * Can the given user delete this record?
     */
    canDelete: (record: ExtendedTestRecord, user: User): boolean => {
        return ExtendedTestRules.canManage(record, user);
    },

    /**
     * The dice pool available for the next roll, after cumulative modifiers.
     *
     * The snapshot of a registered test is what actually gets rolled, so it wins over the
     * starting pool. Recalculate its changes rather than relying on its cached value.
     */
    nextPool: (record: ExtendedTestRecord): number => {
        const pool = foundry.utils.deepClone(record.testData?.pool ?? {
            base: record.dicePool,
            value: record.dicePool,
            changes: [],
        });
        const modifier = new ModifiableValue(pool);
        const next = record.cumulativeModifier
            ? TestRules.extendedModifierValue * record.cumulativeRollCount
            : 0;
        modifier.setUnique('SR5.ExtendedTest', next);
        return modifier.calcTotal({ min: 0 });
    },

    /**
     * Has the record reached its threshold?
     */
    isComplete: (record: ExtendedTestRecord): boolean => {
        const threshold = ExtendedTestRules.threshold(record);
        return threshold > 0 && record.accumulatedHits >= threshold;
    },

    /**
     * Did the last roll of this record end the test with a critical glitch? SR5#48.
     */
    isCriticalGlitchEnd: (record: ExtendedTestRecord): boolean => {
        return record.rolls.at(-1)?.criticalGlitch === true;
    },

    /**
     * Can another roll be made for this record?
     */
    canContinue: (record: ExtendedTestRecord): boolean => {
        return ExtendedTestRules.nextPool(record) > 0
            && TestRules.canExtendTest(ExtendedTestRules.threshold(record), record.accumulatedHits);
    },

    /**
     * Progress towards the threshold in percent. Undefined without a threshold.
     */
    progress: (record: ExtendedTestRecord): number | undefined => {
        const threshold = ExtendedTestRules.threshold(record);
        if (threshold <= 0) return undefined;
        return Math.min(100, Math.round(record.accumulatedHits / threshold * 100));
    },

    /**
     * Amount of full intervals elapsed in game time since the last roll (or creation).
     */
    intervalsElapsed: (record: ExtendedTestRecord, worldTime: number): number => {
        const intervalSeconds = intervalToSeconds(record.interval);
        if (intervalSeconds <= 0) return 0;
        const since = record.lastRollWorldTime ?? record.createdWorldTime;
        return Math.max(0, Math.floor((worldTime - since) / intervalSeconds));
    },

    /**
     * Is a roll due based on elapsed game time?
     */
    isDue: (record: ExtendedTestRecord, worldTime: number): boolean => {
        return record.status === 'active' && ExtendedTestRules.intervalsElapsed(record, worldTime) >= 1;
    },

    /**
     * Does elapsed game time allow another roll? The first roll and records without an
     * interval always pass.
     */
    intervalAllowsRoll: (record: ExtendedTestRecord, worldTime: number): boolean => {
        if (record.rollCount === 0) return true;
        if (intervalToSeconds(record.interval) <= 0) return true;

        // A GM rewinding world time past the last roll re-anchors the interval, instead of
        // locking the record out forever on the clamp in intervalsElapsed.
        if (worldTime < (record.lastRollWorldTime ?? record.createdWorldTime)) return true;

        return ExtendedTestRules.intervalsElapsed(record, worldTime) >= 1;
    },

    /**
     * Has this record run its course? Terminal records only move again through reactivate.
     */
    isTerminal: (record: ExtendedTestRecord): boolean => {
        return ['completed', 'failed', 'cancelled'].includes(record.status);
    },
}
