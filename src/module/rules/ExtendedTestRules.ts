import { TestRules } from "./TestRules";
import { intervalToSeconds } from "../utils/timeUnits";
import { ExtendedTestRecord } from "../types/flows/ExtendedTest";
import { SR5Actor } from "../actor/SR5Actor";

/**
 * Rules and permission handling around managed extended tests.
 *
 * All functions are pure over the given record / user, so they can be unit tested.
 * See SR5#48 'Extended Tests'.
 */
export const ExtendedTestRules = {
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
     * starting pool. Only manually created records lack one.
     */
    nextPool: (record: ExtendedTestRecord): number => {
        const modifier = record.cumulativeModifier ? TestRules.extendedModifierValue * record.rollCount : 0;

        // The snapshot total already contains the modifier of the roll it was taken on.
        const snapshotPool = record.testData?.pool?.value;
        if (snapshotPool !== undefined) {
            const applied = record.cumulativeModifier ? TestRules.extendedModifierValue : 0;
            return Math.max(snapshotPool + applied, 0);
        }

        return Math.max(record.dicePool + modifier, 0);
    },

    /**
     * Has the record reached its threshold?
     */
    isComplete: (record: ExtendedTestRecord): boolean => {
        return record.threshold > 0 && record.accumulatedHits >= record.threshold;
    },

    /**
     * Did the last roll of this record end the test with a critical glitch? SR5#48.
     */
    isCriticalGlitchEnd: (record: ExtendedTestRecord): boolean => {
        return record.rolls.at(-1)?.criticalGlitch === true;
    },

    /**
     * Is this record open ended, without a threshold to reach? Such tests answer 'how far
     * did I get', so running out of pool completes them instead of failing them.
     */
    isOpenEnded: (record: ExtendedTestRecord): boolean => {
        return record.threshold <= 0;
    },

    /**
     * Can another roll be made for this record?
     */
    canContinue: (record: ExtendedTestRecord): boolean => {
        return TestRules.canExtendTest(ExtendedTestRules.nextPool(record), record.threshold, record.accumulatedHits);
    },

    /**
     * Progress towards the threshold in percent. Undefined without a threshold.
     */
    progress: (record: ExtendedTestRecord): number | undefined => {
        if (record.threshold <= 0) return undefined;
        return Math.min(100, Math.round(record.accumulatedHits / record.threshold * 100));
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
        return ExtendedTestRules.intervalsElapsed(record, worldTime) >= 1;
    },
}
